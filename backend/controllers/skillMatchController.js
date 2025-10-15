import { createClient } from '@supabase/supabase-js';
import User from '../models/user.js';
import Job from '../models/Job.js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const calculateSkillMatch = (studentSkills, jobSkills) => {
  if (!jobSkills || jobSkills.length === 0) {
    return {
      matchedSkills: [],
      matchPercentage: 0,
      totalJobSkills: 0,
      studentMatchingSkillsCount: 0
    };
  }

  const normalizedStudentSkills = studentSkills.map(skill =>
    skill.toLowerCase().trim()
  );
  const normalizedJobSkills = jobSkills.map(skill =>
    skill.toLowerCase().trim()
  );

  const matchedSkills = normalizedJobSkills.filter(jobSkill =>
    normalizedStudentSkills.includes(jobSkill)
  );

  const matchPercentage = (matchedSkills.length / normalizedJobSkills.length) * 100;

  return {
    matchedSkills,
    matchPercentage: parseFloat(matchPercentage.toFixed(2)),
    totalJobSkills: jobSkills.length,
    studentMatchingSkillsCount: matchedSkills.length
  };
};

export const calculateJobMatches = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!student.profile?.skills || student.profile.skills.length === 0) {
      return res.status(400).json({
        message: 'Student has no skills listed in profile'
      });
    }

    const jobs = await Job.find({ isActive: true });

    const matches = [];
    for (const job of jobs) {
      const matchResult = calculateSkillMatch(
        student.profile.skills,
        job.skills || []
      );

      const { data, error } = await supabase
        .from('skill_matches')
        .upsert({
          student_id: studentId,
          job_id: job._id.toString(),
          matched_skills: matchResult.matchedSkills,
          match_percentage: matchResult.matchPercentage,
          total_job_skills: matchResult.totalJobSkills,
          student_matching_skills_count: matchResult.studentMatchingSkillsCount,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'student_id,job_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving skill match:', error);
      }

      matches.push({
        jobId: job._id,
        jobTitle: job.title,
        company: job.company,
        location: job.location,
        matchedSkills: matchResult.matchedSkills,
        matchPercentage: matchResult.matchPercentage,
        totalJobSkills: matchResult.totalJobSkills,
        studentMatchingSkillsCount: matchResult.studentMatchingSkillsCount
      });
    }

    matches.sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.status(200).json({
      success: true,
      studentId,
      studentSkills: student.profile.skills,
      totalJobs: jobs.length,
      matches
    });
  } catch (error) {
    console.error('Error calculating job matches:', error);
    res.status(500).json({
      message: 'Error calculating job matches',
      error: error.message
    });
  }
};

export const getStudentMatches = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { minMatch = 0 } = req.query;

    const { data: matches, error } = await supabase
      .from('skill_matches')
      .select('*')
      .eq('student_id', studentId)
      .gte('match_percentage', parseFloat(minMatch))
      .order('match_percentage', { ascending: false });

    if (error) {
      return res.status(500).json({
        message: 'Error fetching matches',
        error: error.message
      });
    }

    const jobIds = matches.map(match => match.job_id);
    const jobs = await Job.find({ _id: { $in: jobIds } });

    const enrichedMatches = matches.map(match => {
      const job = jobs.find(j => j._id.toString() === match.job_id);
      return {
        ...match,
        jobDetails: job ? {
          title: job.title,
          company: job.company,
          location: job.location,
          type: job.type,
          experience: job.experience,
          description: job.description
        } : null
      };
    });

    res.status(200).json({
      success: true,
      studentId,
      totalMatches: matches.length,
      matches: enrichedMatches
    });
  } catch (error) {
    console.error('Error fetching student matches:', error);
    res.status(500).json({
      message: 'Error fetching student matches',
      error: error.message
    });
  }
};

export const getJobCandidates = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { minMatch = 0 } = req.query;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const { data: matches, error } = await supabase
      .from('skill_matches')
      .select('*')
      .eq('job_id', jobId)
      .gte('match_percentage', parseFloat(minMatch))
      .order('match_percentage', { ascending: false });

    if (error) {
      return res.status(500).json({
        message: 'Error fetching candidates',
        error: error.message
      });
    }

    const studentIds = matches.map(match => match.student_id);
    const students = await User.find({ _id: { $in: studentIds } });

    const enrichedMatches = matches.map(match => {
      const student = students.find(s => s._id.toString() === match.student_id);
      return {
        ...match,
        studentDetails: student ? {
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          profile: student.profile
        } : null
      };
    });

    res.status(200).json({
      success: true,
      jobId,
      jobTitle: job.title,
      totalCandidates: matches.length,
      matches: enrichedMatches
    });
  } catch (error) {
    console.error('Error fetching job candidates:', error);
    res.status(500).json({
      message: 'Error fetching job candidates',
      error: error.message
    });
  }
};

export const getSingleMatch = async (req, res) => {
  try {
    const { studentId, jobId } = req.params;

    const { data: match, error } = await supabase
      .from('skill_matches')
      .select('*')
      .eq('student_id', studentId)
      .eq('job_id', jobId)
      .maybeSingle();

    if (error) {
      return res.status(500).json({
        message: 'Error fetching match',
        error: error.message
      });
    }

    if (!match) {
      const student = await User.findById(studentId);
      const job = await Job.findById(jobId);

      if (!student || !job) {
        return res.status(404).json({
          message: 'Student or job not found'
        });
      }

      const matchResult = calculateSkillMatch(
        student.profile?.skills || [],
        job.skills || []
      );

      return res.status(200).json({
        success: true,
        match: {
          student_id: studentId,
          job_id: jobId,
          matched_skills: matchResult.matchedSkills,
          match_percentage: matchResult.matchPercentage,
          total_job_skills: matchResult.totalJobSkills,
          student_matching_skills_count: matchResult.studentMatchingSkillsCount,
          calculated: true
        }
      });
    }

    res.status(200).json({
      success: true,
      match
    });
  } catch (error) {
    console.error('Error fetching single match:', error);
    res.status(500).json({
      message: 'Error fetching match',
      error: error.message
    });
  }
};
