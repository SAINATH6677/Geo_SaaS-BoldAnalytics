import { Link } from 'react-router-dom'

function Sidebar() {

  const logout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-5 fixed">

      <h1 className="text-2xl font-bold mb-10">
        Geo SaaS
      </h1>

      <div className="flex flex-col gap-4">

        <Link to="/dashboard">Dashboard</Link>
        <Link to="/users">Users</Link>
        <Link to="/logs">Logs</Link>
        <Link to="/analytics">Analytics</Link>
        <Link to="/geo-search">Geo Search</Link>

        <a
          href="http://localhost:5000/docs"
          target="_blank"
        >
          Swagger Docs
        </a>

        <button
          onClick={logout}
          className="bg-red-500 p-2 rounded mt-5"
        >
          Logout
        </button>

      </div>

    </div>
  )
}

export default Sidebar