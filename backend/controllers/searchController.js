import { supabase } from '../config/supabase.js';

export const unifiedSearch = async (req, res) => {
  try {
    const {
      query,
      type = 'all',
      page = 1,
      limit = 10
    } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchQuery = query.trim();
    const results = {
      students: [],
      alumni: [],
      employers: [],
      companies: []
    };

    if (type === 'all' || type === 'users') {
      const userTypes = ['student', 'alumni', 'employer'];

      for (const userType of userTypes) {
        if (type === 'all' || type === userType + 's') {
          const { data: users, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('role', userType)
            .eq('is_active', true)
            .or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%,position.ilike.%${searchQuery}%,university.ilike.%${searchQuery}%`)
            .limit(parseInt(limit));

          if (!error && users) {
            results[userType + 's'] = users;
          }
        }
      }
    }

    if (type === 'all' || type === 'companies') {
      const { data: companies, error } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,industry.ilike.%${searchQuery}%`)
        .limit(parseInt(limit));

      if (!error && companies) {
        results.companies = companies;
      }
    }

    const totalResults =
      results.students.length +
      results.alumni.length +
      results.employers.length +
      results.companies.length;

    res.status(200).json({
      success: true,
      query: searchQuery,
      totalResults,
      results
    });
  } catch (error) {
    console.error('Unified search error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during search',
      error: error.message
    });
  }
};

export const searchByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const {
      query,
      page = 1,
      limit = 20,
      skills,
      location,
      university
    } = req.query;

    if (!['student', 'alumni', 'employer'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be student, alumni, or employer'
      });
    }

    let dbQuery = supabase
      .from('user_profiles')
      .select('*', { count: 'exact' })
      .eq('role', role)
      .eq('is_active', true);

    if (query) {
      dbQuery = dbQuery.or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,bio.ilike.%${query}%,position.ilike.%${query}%`);
    }

    if (location) {
      dbQuery = dbQuery.ilike('location', `%${location}%`);
    }

    if (university) {
      dbQuery = dbQuery.ilike('university', `%${university}%`);
    }

    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      dbQuery = dbQuery.contains('skills', skillsArray);
    }

    const offset = (page - 1) * limit;
    dbQuery = dbQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    const { data: users, error, count } = await dbQuery;

    if (error) {
      console.error('Search by role error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to search users',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      role,
      count: users.length,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      users
    });
  } catch (error) {
    console.error('Search by role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const searchCompanies = async (req, res) => {
  try {
    const {
      query,
      industry,
      size,
      location,
      page = 1,
      limit = 20
    } = req.query;

    let dbQuery = supabase
      .from('company_profiles')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    if (query) {
      dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%,industry.ilike.%${query}%`);
    }

    if (industry) {
      dbQuery = dbQuery.ilike('industry', `%${industry}%`);
    }

    if (size) {
      dbQuery = dbQuery.eq('size', size);
    }

    if (location) {
      dbQuery = dbQuery.ilike('headquarters', `%${location}%`);
    }

    const offset = (page - 1) * limit;
    dbQuery = dbQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    const { data: companies, error, count } = await dbQuery;

    if (error) {
      console.error('Search companies error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to search companies',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      count: companies.length,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      companies
    });
  } catch (error) {
    console.error('Search companies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
