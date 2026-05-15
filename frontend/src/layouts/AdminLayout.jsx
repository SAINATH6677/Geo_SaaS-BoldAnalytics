import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'

function AdminLayout({ children }) {

  return (
    <div className="flex">

      <Sidebar />

      <div className="ml-64 w-full">

        <Navbar />

        <div className="p-6">
          {children}
        </div>

      </div>

    </div>
  )
}

export default AdminLayout