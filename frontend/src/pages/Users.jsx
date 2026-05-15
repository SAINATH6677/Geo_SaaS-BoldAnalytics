import { useEffect, useState } from 'react'

import api from '../api/axios'
import AdminLayout from '../layouts/AdminLayout'

function Users() {

  const [users, setUsers] = useState([])

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {

    try {

      const res = await api.get('/admin/users')

      setUsers(res.data.data)

    } catch (err) {
      console.error(err)
    }
  }

  const approveUser = async (id) => {

    try {

      await api.patch(`/admin/users/${id}/approve`)

      fetchUsers()

    } catch (err) {
      console.error(err)
    }
  }

  const suspendUser = async (id) => {

    try {

      await api.patch(`/admin/users/${id}/suspend`)

      fetchUsers()

    } catch (err) {
      console.error(err)
    }
  }

  return (

    <AdminLayout>

      <div className="bg-white p-5 rounded shadow">

        <h2 className="text-2xl font-bold mb-5">
          Users
        </h2>

        <table className="w-full border">

          <thead>

            <tr className="bg-gray-100">

              <th className="p-3 text-left">
                Company
              </th>

              <th className="p-3 text-left">
                Plan
              </th>

              <th className="p-3 text-left">
                Status
              </th>

              <th className="p-3 text-left">
                API Key
              </th>

              <th className="p-3 text-left">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {users.map((user) => (

              <tr
                key={user.id}
                className="border-t"
              >

                <td className="p-3">
                  {user.company_name}
                </td>

                <td className="p-3">
                  {user.plan}
                </td>

                <td className="p-3">
                  {user.status}
                </td>

                <td className="p-3">
                  {user.api_key}
                </td>

                <td className="p-3 flex gap-2">

                  <button
                    onClick={() => approveUser(user.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => suspendUser(user.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Suspend
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </AdminLayout>
  )
}

export default Users