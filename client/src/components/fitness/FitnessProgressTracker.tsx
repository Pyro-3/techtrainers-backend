import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { statsAPI } from '../../services/api';
import {
  BarChart2,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  RefreshCw,
  PlusCircle,
  Trash2,
  Download
} from 'lucide-react';
import { saveAs } from 'file-saver';

interface StatDataPoint {
  week: number;
  value: number;
}

interface FitnessStat {
  _id?: string;
  type: string;
  value: number;
  unit: string;
  createdAt?: string;
  history?: StatDataPoint[];
}

const FitnessProgressTracker = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<FitnessStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newStat, setNewStat] = useState({ type: '', value: '', unit: '' });
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await statsAPI.getUserStats();
        setStats(res.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await statsAPI.addUserStat({
        type: newStat.type,
        value: Number(newStat.value),
        unit: newStat.unit
      });
      setNewStat({ type: '', value: '', unit: '' });
      setShowForm(false);
      const updated = await statsAPI.getUserStats();
      setStats(updated.data);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id || !confirm('Delete this stat?')) return;
    try {
      await statsAPI.deleteUserStat(id);
      setStats(stats.filter(stat => stat._id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const exportCSV = () => {
    const headers = ['Type', 'Value', 'Unit', 'Date'];
    const rows = stats.map(stat => [
      stat.type,
      stat.value,
      stat.unit,
      stat.createdAt ? new Date(stat.createdAt).toLocaleDateString() : 'N/A'
    ]);
    const csvContent = [headers, ...rows]
      .map(row => row.map(String).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'fitness_stats.csv');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-stone-800">My Fitness Progress</h2>
        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1 bg-sky-600 hover:bg-sky-700 text-white px-3 py-2 rounded-lg"
          >
            <Download size={18} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 bg-amber-700 hover:bg-amber-800 text-white px-3 py-2 rounded-lg"
          >
            <PlusCircle size={18} />
            <span>Add Stat</span>
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-stone-50 p-4 rounded-lg mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Stat Type (e.g. Weight)"
              value={newStat.type}
              onChange={(e) => setNewStat({ ...newStat, type: e.target.value })}
              className="p-2 border border-stone-300 rounded"
              required
            />
            <input
              type="number"
              placeholder="Value"
              value={newStat.value}
              onChange={(e) => setNewStat({ ...newStat, value: e.target.value })}
              className="p-2 border border-stone-300 rounded"
              required
            />
            <input
              type="text"
              placeholder="Unit (e.g. kg)"
              value={newStat.unit}
              onChange={(e) => setNewStat({ ...newStat, unit: e.target.value })}
              className="p-2 border border-stone-300 rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save Stat'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-10">
          <Loader2 className="animate-spin h-8 w-8 text-amber-600 mx-auto mb-2" />
          <p className="text-stone-600">Loading your progress...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <AlertCircle className="text-red-500 h-8 w-8 mx-auto mb-2" />
          <p className="text-stone-800 font-medium mb-1">Error loading stats</p>
          <p className="text-stone-600 text-sm mb-3">{error}</p>
          <button onClick={() => window.location.reload()} className="text-amber-700">Retry</button>
        </div>
      ) : stats.length === 0 ? (
        <div className="text-center py-10">
          <BarChart2 className="text-stone-400 h-8 w-8 mx-auto mb-2" />
          <p className="text-stone-800 font-medium">No stats yet</p>
          <p className="text-stone-600 text-sm">Add a new stat to begin tracking.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {stats.map((stat, index) => (
            <div key={index} className="border border-stone-200 rounded-lg overflow-hidden">
              <div
                className="p-4 cursor-pointer hover:bg-stone-50 transition-colors"
                onClick={() => setExpandedId(expandedId === stat._id ? null : stat._id ?? null)}

              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-stone-800 capitalize">{stat.type}</h3>
                  <div className="flex items-center gap-3">
                    <p className="text-2xl font-bold text-stone-900">
                      {stat.value} <span className="text-base text-stone-500">{stat.unit}</span>
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(stat._id);
                      }}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={20} />
                    </button>
                    {expandedId === stat._id ? (
                      <ChevronUp size={20} className="text-stone-500" />
                    ) : (
                      <ChevronDown size={20} className="text-stone-500" />
                    )}
                  </div>
                </div>
                <p className="text-sm text-stone-500 mt-1">
                  {stat.createdAt ? new Date(stat.createdAt).toLocaleDateString() : 'No date'}
                </p>
              </div>
              {expandedId === stat._id && (
                <div className="bg-stone-50 px-4 py-2">
                  <h4 className="text-sm text-stone-500 mb-1">Trend</h4>
                  <div className="flex gap-1 items-end h-24">
                    {(stat.history || []).map((pt, i) => (
                      <div
                        key={i}
                        className="bg-amber-600 rounded-t"
                        style={{ height: `${Math.max(4, pt.value)}px`, width: '8px' }}
                        title={`Week ${pt.week}: ${pt.value}`}
                      ></div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FitnessProgressTracker;
