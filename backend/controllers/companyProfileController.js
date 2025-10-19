import { supabase } from '../config/supabase.js';

export const createCompanyProfile = async (req, res) => {
  try {
    const employerId = req.user.id;

    const {
      name,
      description,
      industry,
      size,
      founded,
      headquarters,
      website,
      logo,
      coverImage,
      socialLinks,
      benefits,
      culture,
      values,
      technologies,
      locations
    } = req.body;

    if (!name || !description || !industry || !size || !headquarters) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, industry, size, and headquarters are required'
      });
    }

    const { data: existingCompany } = await supabase
      .from('company_profiles')
      .select('id')
      .eq('name', name)
      .maybeSingle();

    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: 'A company with this name already exists'
      });
    }

    const companyData = {
      employer_id: employerId,
      name,
      description,
      industry,
      size,
      founded: founded || null,
      headquarters,
      website: website || null,
      logo: logo || null,
      cover_image: coverImage || null,
      social_links: socialLinks || {},
      benefits: benefits || [],
      culture: culture || null,
      values: values || [],
      technologies: technologies || [],
      locations: locations || [],
      is_active: true
    };

    const { data: company, error } = await supabase
      .from('company_profiles')
      .insert([companyData])
      .select()
      .single();

    if (error) {
      console.error('Create company profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create company profile',
        error: error.message
      });
    }

    res.status(201).json({
      success: true,
      company,
      message: 'Company profile created successfully'
    });
  } catch (error) {
    console.error('Create company profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during company profile creation',
      error: error.message
    });
  }
};

export const getCompanyProfiles = async (req, res) => {
  try {
    const {
      search,
      industry,
      size,
      location,
      page = 1,
      limit = 12,
      sort = 'created_at'
    } = req.query;

    let query = supabase
      .from('company_profiles')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,industry.ilike.%${search}%`);
    }

    if (industry) {
      query = query.ilike('industry', `%${industry}%`);
    }

    if (size) {
      query = query.eq('size', size);
    }

    if (location) {
      query = query.ilike('headquarters', `%${location}%`);
    }

    const sortOrder = sort.startsWith('-') ? 'desc' : 'asc';
    const sortField = sort.replace('-', '');
    query = query.order(sortField, { ascending: sortOrder === 'asc' });

    const offset = (page - 1) * limit;
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: companies, error, count } = await query;

    if (error) {
      console.error('Get company profiles error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch company profiles',
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
    console.error('Get company profiles error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const getCompanyProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: company, error } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error || !company) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found'
      });
    }

    res.status(200).json({
      success: true,
      company
    });
  } catch (error) {
    console.error('Get company profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const updateCompanyProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const employerId = req.user.id;

    const { data: company, error: fetchError } = await supabase
      .from('company_profiles')
      .select('employer_id')
      .eq('id', id)
      .single();

    if (fetchError || !company) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found'
      });
    }

    if (company.employer_id !== employerId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this company profile'
      });
    }

    const updateData = { ...req.body };
    delete updateData.employer_id;
    delete updateData.id;
    delete updateData.created_at;

    const { data: updatedCompany, error } = await supabase
      .from('company_profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update company profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update company profile',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      company: updatedCompany,
      message: 'Company profile updated successfully'
    });
  } catch (error) {
    console.error('Update company profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const deleteCompanyProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const employerId = req.user.id;

    const { data: company, error: fetchError } = await supabase
      .from('company_profiles')
      .select('employer_id')
      .eq('id', id)
      .single();

    if (fetchError || !company) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found'
      });
    }

    if (company.employer_id !== employerId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this company profile'
      });
    }

    const { error } = await supabase
      .from('company_profiles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete company profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete company profile',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Company profile deleted successfully'
    });
  } catch (error) {
    console.error('Delete company profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const getMyCompanyProfiles = async (req, res) => {
  try {
    const employerId = req.user.id;

    const { data: companies, error } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('employer_id', employerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get my company profiles error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch company profiles',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      count: companies.length,
      companies
    });
  } catch (error) {
    console.error('Get my company profiles error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
