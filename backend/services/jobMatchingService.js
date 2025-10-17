const calculateSkillMatch = (userSkills, jobSkills) => {
  if (!jobSkills || jobSkills.length === 0) {
    return { score: 100, matchedSkills: [], totalSkills: 0 };
  }

  if (!userSkills || userSkills.length === 0) {
    return { score: 0, matchedSkills: [], totalSkills: jobSkills.length };
  }

  const normalizedUserSkills = userSkills.map(skill => skill.toLowerCase().trim());
  const normalizedJobSkills = jobSkills.map(skill => skill.toLowerCase().trim());

  const matchedSkills = normalizedJobSkills.filter(jobSkill =>
    normalizedUserSkills.some(userSkill =>
      userSkill.includes(jobSkill) || jobSkill.includes(userSkill)
    )
  );

  const score = (matchedSkills.length / normalizedJobSkills.length) * 100;

  return {
    score: Math.round(score),
    matchedSkills,
    totalSkills: jobSkills.length
  };
};

const parseExperienceYears = (experienceStr) => {
  if (!experienceStr) return 0;

  const match = experienceStr.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
};

const calculateExperienceMatch = (userProfile, jobExperience) => {
  const userYears = userProfile.graduationYear
    ? new Date().getFullYear() - userProfile.graduationYear
    : 0;

  const requiredYears = parseExperienceYears(jobExperience);

  let score = 0;
  if (requiredYears === 0) {
    score = 100;
  } else if (userYears >= requiredYears) {
    score = 100;
  } else if (userYears >= requiredYears * 0.75) {
    score = 80;
  } else if (userYears >= requiredYears * 0.5) {
    score = 60;
  } else {
    score = 40;
  }

  return {
    score,
    userExperience: `${userYears} years`,
    requiredExperience: jobExperience
  };
};

const calculateLocationMatch = (userLocation, jobLocation) => {
  if (!jobLocation) {
    return { score: 100, matched: true };
  }

  if (!userLocation) {
    return { score: 50, matched: false };
  }

  const normalizedUserLocation = userLocation.toLowerCase().trim();
  const normalizedJobLocation = jobLocation.toLowerCase().trim();

  const matched = normalizedUserLocation.includes(normalizedJobLocation) ||
                  normalizedJobLocation.includes(normalizedUserLocation) ||
                  normalizedJobLocation.includes('remote') ||
                  normalizedJobLocation.includes('anywhere');

  return {
    score: matched ? 100 : 50,
    matched
  };
};

export const calculateJobMatch = (user, job) => {
  const skillMatch = calculateSkillMatch(user.profile?.skills || [], job.skills || []);
  const experienceMatch = calculateExperienceMatch(user.profile || {}, job.experience);
  const locationMatch = calculateLocationMatch(user.profile?.location, job.location);

  const weights = {
    skills: 0.5,
    experience: 0.3,
    location: 0.2
  };

  const overallScore = Math.round(
    (skillMatch.score * weights.skills) +
    (experienceMatch.score * weights.experience) +
    (locationMatch.score * weights.location)
  );

  return {
    matchScore: overallScore,
    matchDetails: {
      skillMatch,
      experienceMatch,
      locationMatch
    }
  };
};

export const rankJobs = (matchedJobs) => {
  return matchedJobs.sort((a, b) => b.matchScore - a.matchScore);
};

export const filterRelevantJobs = (matchedJobs, minScore = 40) => {
  return matchedJobs.filter(job => job.matchScore >= minScore);
};
