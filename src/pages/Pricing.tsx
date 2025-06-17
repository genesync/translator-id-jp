export default function PricingPage() {
  return (
    <div className="max-w-xl mx-auto p-6 text-center">
      <h1 className="text-3xl font-bold mb-6">Pilih Paket Langganan</h1>
      <div className="grid grid-cols-1 gap-4">
        <div className="p-6 rounded-xl shadow border">
          <h2 className="text-xl font-semibold">Gratis</h2>
          <p className="text-sm text-gray-500">Akses terbatas ke fitur dasar</p>
          <p className="mt-4 text-2xl font-bold">Rp 0</p>
        </div>
        <div className="p-6 rounded-xl shadow border">
          <h2 className="text-xl font-semibold">Pro Bulanan</h2>
          <p className="text-sm text-gray-500">Semua fitur premium</p>
          <p className="mt-4 text-2xl font-bold">Rp 29.000 / bulan</p>
          <button className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-xl">Langganan</button>
        </div>
        <div className="p-6 rounded-xl shadow border">
          <h2 className="text-xl font-semibold">Pro Tahunan</h2>
          <p className="text-sm text-gray-500">Hemat lebih banyak</p>
          <p className="mt-4 text-2xl font-bold">Rp 249.000 / tahun</p>
          <button className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-xl">Langganan</button>
        </div>
        <div className="p-6 rounded-xl shadow border">
          <h2 className="text-xl font-semibold">Lifetime</h2>
          <p className="text-sm text-gray-500">Sekali bayar, akses selamanya</p>
          <p className="mt-4 text-2xl font-bold">Rp 499.000</p>
          <button className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-xl">Beli Sekarang</button>
        </div>
      </div>
    </div>
  );
}