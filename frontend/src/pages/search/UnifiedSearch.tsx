import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { unifiedSearch, SearchResults } from '../../services/searchService';

const UnifiedSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [totalResults, setTotalResults] = useState(0);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const data = await unifiedSearch(query, type);
      setResults(data.results);
      setTotalResults(data.totalResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Search</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search for people or companies..."
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        <div className="flex gap-2">
          {['all', 'students', 'alumni', 'employers', 'companies'].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-4 py-2 rounded-lg ${
                type === t
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {results && (
        <div className="space-y-6">
          <div className="text-gray-600">
            Found {totalResults} result{totalResults !== 1 ? 's' : ''}
          </div>

          {results.students.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Students</h2>
              <div className="grid gap-4">
                {results.students.map((student) => (
                  <Link
                    key={student.id}
                    to={`/profile/${student.id}`}
                    className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition"
                  >
                    <div className="flex items-start gap-4">
                      {student.avatar ? (
                        <img
                          src={student.avatar}
                          alt={student.first_name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold">
                          {student.first_name[0]}{student.last_name[0]}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold">
                          {student.first_name} {student.last_name}
                        </h3>
                        {student.university && (
                          <p className="text-gray-600">{student.university}</p>
                        )}
                        {student.bio && (
                          <p className="text-gray-700 mt-2">{student.bio}</p>
                        )}
                        {student.skills && student.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {student.skills.slice(0, 5).map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.alumni.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Alumni</h2>
              <div className="grid gap-4">
                {results.alumni.map((alumni) => (
                  <Link
                    key={alumni.id}
                    to={`/profile/${alumni.id}`}
                    className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition"
                  >
                    <div className="flex items-start gap-4">
                      {alumni.avatar ? (
                        <img
                          src={alumni.avatar}
                          alt={alumni.first_name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center text-xl font-bold">
                          {alumni.first_name[0]}{alumni.last_name[0]}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold">
                          {alumni.first_name} {alumni.last_name}
                        </h3>
                        {alumni.position && alumni.company && (
                          <p className="text-gray-600">
                            {alumni.position} at {alumni.company}
                          </p>
                        )}
                        {alumni.bio && (
                          <p className="text-gray-700 mt-2">{alumni.bio}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.employers.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Employers</h2>
              <div className="grid gap-4">
                {results.employers.map((employer) => (
                  <Link
                    key={employer.id}
                    to={`/profile/${employer.id}`}
                    className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition"
                  >
                    <div className="flex items-start gap-4">
                      {employer.avatar ? (
                        <img
                          src={employer.avatar}
                          alt={employer.first_name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-orange-500 text-white flex items-center justify-center text-xl font-bold">
                          {employer.first_name[0]}{employer.last_name[0]}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold">
                          {employer.first_name} {employer.last_name}
                        </h3>
                        {employer.company && (
                          <p className="text-gray-600">{employer.company}</p>
                        )}
                        {employer.bio && (
                          <p className="text-gray-700 mt-2">{employer.bio}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.companies.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Companies</h2>
              <div className="grid gap-4">
                {results.companies.map((company) => (
                  <Link
                    key={company.id}
                    to={`/company/${company.id}`}
                    className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition"
                  >
                    <div className="flex items-start gap-4">
                      {company.logo ? (
                        <img
                          src={company.logo}
                          alt={company.name}
                          className="w-16 h-16 rounded object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded bg-gray-300 flex items-center justify-center text-2xl font-bold text-gray-600">
                          {company.name[0]}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold">{company.name}</h3>
                        <p className="text-gray-600">
                          {company.industry} • {company.size} employees
                        </p>
                        <p className="text-gray-700 mt-2 line-clamp-2">
                          {company.description}
                        </p>
                        <div className="flex gap-4 mt-2 text-sm text-gray-600">
                          <span>{company.headquarters}</span>
                          {company.open_positions > 0 && (
                            <span>{company.open_positions} open positions</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {totalResults === 0 && (
            <div className="text-center py-12 text-gray-500">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UnifiedSearch;
