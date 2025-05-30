// technicianService.js
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { createKyThuatVien } from '../models/kyThuatVienModel';
import { createTaiKhoan } from '../models/taiKhoanModel';
import { createPhanCongKtv } from '../models/phanCongKtvModel';

export async function getTechniciansWithFilters({ search = '', chuyenMonIds = [], trangThai = [] }) {
    const kyThuatVienSnap = await getDocs(collection(db, 'ky_thuat_vien'));
    const taiKhoanSnap = await getDocs(collection(db, 'tai_khoan'));
    const phanCongSnap = await getDocs(collection(db, 'phan_cong_ktv'));
    const chuyenMonKtvSnap = await getDocs(collection(db, 'chuyen_mon_ktv'));

    const taiKhoanMap = {};
    taiKhoanSnap.forEach((doc) => {
        const tk = createTaiKhoan(doc);
        taiKhoanMap[tk.id] = tk;
    });

    const chuyenMonMap = {}; // kyThuatVienId -> [chuyenMonId]
    chuyenMonKtvSnap.forEach((doc) => {
        const { kyThuatVienId, chuyenMonId } = doc.data();
        if (!chuyenMonMap[kyThuatVienId]) chuyenMonMap[kyThuatVienId] = [];
        chuyenMonMap[kyThuatVienId].push(chuyenMonId);
    });

    const taskMap = {}; // taiKhoanKTVId -> count
    phanCongSnap.forEach((doc) => {
        const pc = createPhanCongKtv(doc);
        if (["DANG_THUC_HIEN", "DA_CHAP_NHAN", "TAM_NGHI"].includes(pc.trangThai)) {
            taskMap[pc.taiKhoanKTVId] = (taskMap[pc.taiKhoanKTVId] || 0) + 1;
        }
    });

    const result = [];
    kyThuatVienSnap.forEach((doc) => {
        const ktv = createKyThuatVien(doc);
        const tk = taiKhoanMap[ktv.taiKhoanId];
        if (!tk) return;

        const cmList = chuyenMonMap[ktv.id] || [];
        if (search && !tk.hoTen.toLowerCase().includes(search.toLowerCase())) return;
        if (trangThai.length && !trangThai.includes(ktv.trangThaiHienTai)) return;
        if (chuyenMonIds.length && !chuyenMonIds.some((id) => cmList.includes(id))) return;

        result.push({
            id: tk.id,
            hoTen: tk.hoTen,
            trangThai: ktv.trangThaiHienTai,
            taskCount: taskMap[tk.id] || 0,
            chuyenMonIds: cmList,
        });
    });

    return result;
}
