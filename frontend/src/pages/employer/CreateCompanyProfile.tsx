import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCompanyProfile } from '../../services/companyProfileService';

const CreateCompanyProfile: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: '',
    size: '1-10',
    founded: '',
    headquarters: '',
    website: '',
    logo: '',
    coverImage: '',
    linkedin: '',
    twitter: '',
    facebook: '',
    instagram: '',
    benefits: '',
    culture: '',
    values: '',
    technologies: '',
    locations: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = {
        name: formData.name,
        description: formData.description,
        industry: formData.industry,
        size: formData.size,
        founded: formData.founded ? parseInt(formData.founded) : undefined,
        headquarters: formData.headquarters,
        website: formData.website || undefined,
        logo: formData.logo || undefined,
        coverImage: formData.coverImage || undefined,
        socialLinks: {
          linkedin: formData.linkedin || undefined,
          twitter: formData.twitter || undefined,
          facebook: formData.facebook || undefined,
          instagram: formData.instagram || undefined
        },
        benefits: formData.benefits ? formData.benefits.split(',').map(b => b.trim()) : [],
        culture: formData.culture || undefined,
        values: formData.values ? formData.values.split(',').map(v => v.trim()) : [],
        technologies: formData.technologies ? formData.technologies.split(',').map(t => t.trim()) : [],
        locations: formData.locations ? formData.locations.split(',').map(l => l.trim()) : []
      };

      await createCompanyProfile(data);
      navigate('/employer/manage-companies');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create company profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create Company Profile</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium mb-2">Company Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Industry *</label>
              <input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Company Size *</label>
              <select
                name="size"
                value={formData.size}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="1-10">1-10</option>
                <option value="11-50">11-50</option>
                <option value="51-200">51-200</option>
                <option value="201-500">201-500</option>
                <option value="501-1000">501-1000</option>
                <option value="1000+">1000+</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Founded Year</label>
              <input
                type="number"
                name="founded"
                value={formData.founded}
                onChange={handleChange}
                min="1800"
                max={new Date().getFullYear()}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Headquarters *</label>
              <input
                type="text"
                name="headquarters"
                value={formData.headquarters}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Website</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Branding</h2>

          <div>
            <label className="block text-sm font-medium mb-2">Logo URL</label>
            <input
              type="url"
              name="logo"
              value={formData.logo}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Cover Image URL</label>
            <input
              type="url"
              name="coverImage"
              value={formData.coverImage}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Social Links</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">LinkedIn</label>
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Twitter</label>
              <input
                type="url"
                name="twitter"
                value={formData.twitter}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Facebook</label>
              <input
                type="url"
                name="facebook"
                value={formData.facebook}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Instagram</label>
              <input
                type="url"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Company Culture</h2>

          <div>
            <label className="block text-sm font-medium mb-2">Culture Description</label>
            <textarea
              name="culture"
              value={formData.culture}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Benefits (comma-separated)</label>
            <input
              type="text"
              name="benefits"
              value={formData.benefits}
              onChange={handleChange}
              placeholder="Health insurance, Remote work, Flexible hours"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Company Values (comma-separated)</label>
            <input
              type="text"
              name="values"
              value={formData.values}
              onChange={handleChange}
              placeholder="Innovation, Teamwork, Excellence"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Technologies (comma-separated)</label>
            <input
              type="text"
              name="technologies"
              value={formData.technologies}
              onChange={handleChange}
              placeholder="React, Node.js, Python"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Office Locations (comma-separated)</label>
            <input
              type="text"
              name="locations"
              value={formData.locations}
              onChange={handleChange}
              placeholder="New York, London, Tokyo"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Company Profile'}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCompanyProfile;
