import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, deleteUser } from '../store/slices/userSlice';
import { FiTrash2, FiUser } from 'react-icons/fi';

const Users = () => {
  const dispatch = useDispatch();
  const { users, loading, total } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchUsers({ limit: 50 }));
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await dispatch(deleteUser(id));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Users ({total})</h1>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium">User</th>
                  <th className="text-left py-3 px-4 font-medium">Phone</th>
                  <th className="text-left py-3 px-4 font-medium">Role</th>
                  <th className="text-left py-3 px-4 font-medium">Joined</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center"><FiUser className="w-5 h-5" /></div>
                        <div><p className="font-medium">{user.name}</p><p className="text-sm text-gray-500">{user.email}</p></div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{user.phone}</td>
                    <td className="py-3 px-4"><span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-success'}`}>{user.role}</span></td>
                    <td className="py-3 px-4 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      {user.role !== 'admin' && (
                        <button onClick={() => handleDelete(user._id)} className="p-2 hover:bg-red-100 text-red-600 rounded"><FiTrash2 className="w-4 h-4" /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
