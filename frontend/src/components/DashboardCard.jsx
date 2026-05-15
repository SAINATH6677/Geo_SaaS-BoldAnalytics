function DashboardCard({ title, value }) {

  return (
    <div className="bg-white p-5 rounded shadow">

      <h3 className="text-gray-500">
        {title}
      </h3>

      <p className="text-3xl font-bold mt-2">
        {value}
      </p>

    </div>
  )
}

export default DashboardCard