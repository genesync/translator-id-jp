import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const ModalPricing = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
            size="sm"
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:from-indigo-600 hover:to-purple-700"
        >
            Upgrade Pro
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Paket Harga</DialogTitle>
          <DialogDescription>
            Pilih paket sesuai kebutuhan kamu.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Paket Gratis */}
          <div className="border p-4 rounded-xl shadow-md bg-white dark:bg-gray-900">
            <h3 className="text-lg font-bold">Gratis</h3>
            <p className="text-sm text-gray-500">Fitur dasar</p>
            <ul className="text-sm mt-2 space-y-1">
              <li>✓ Terjemahan Indo ⇄ Jepang</li>
              <li>✓ JLPT N5-N3</li>
              <li>✓ Simpan Riwayat</li>
            </ul>
            <Button className="mt-4 w-full" disabled>
              Aktif
            </Button>
          </div>

          {/* Paket Pro */}
          <div className="border p-4 rounded-xl shadow-md bg-white dark:bg-gray-900">
            <h3 className="text-lg font-bold">Pro</h3>
            <p className="text-sm text-gray-500">Lebih canggih</p>
            <ul className="text-sm mt-2 space-y-1">
              <li>✓ Semua fitur Gratis</li>
              <li>✓ AI grammar check</li>
              <li>✓ Mode percakapan</li>
            </ul>
            <Button className="mt-4 w-full">Langganan</Button>
          </div>

          {/* Paket Tim */}
          <div className="border p-4 rounded-xl shadow-md bg-white dark:bg-gray-900">
            <h3 className="text-lg font-bold">Tim</h3>
            <p className="text-sm text-gray-500">Untuk agensi/kelas</p>
            <ul className="text-sm mt-2 space-y-1">
              <li>✓ Semua fitur Pro</li>
              <li>✓ 5 pengguna</li>
              <li>✓ Support prioritas</li>
            </ul>
            <Button className="mt-4 w-full">Hubungi Kami</Button>
          </div>
        </div>

        <DialogClose asChild>
          <Button variant="ghost" className="absolute top-2 right-2">
            ✕
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default ModalPricing;
