import React from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';
import AppLayout from '../components/layout/AppLayout';
import { normalizeCollection } from '../services/normalizeTools';
import {
  defaultYeuCau,
  defaultTaiKhoan,
  defaultThietBi,
  defaultPhanCong,
  defaultPhanCongKtv,
  defaultKyThuatVien,
  defaultVaiTro,
  defaultDonVi,
  defaultTang,
  defaultDay,
  defaultPhong,
  defaultLoaiPhong,
  defaultLoaiThietBi,
  defaultChuyenMon,
  defaultChuyenMonKtv,
  defaultBaiViet,
  defaultBienBanYeuCau,
  defaultChiTietYeuCau,
  defaultAnhMinhChungBaoCao,
  defaultAnhMinhChungLamViec,
  defaultDanhGiaKtv,
  defaultThongBao
} from '../models';

const allCollections = [
  { name: 'yeu_cau', model: defaultYeuCau },
  { name: 'tai_khoan', model: defaultTaiKhoan },
  { name: 'thiet_bi', model: defaultThietBi },
  { name: 'phan_cong', model: defaultPhanCong },
  { name: 'phan_cong_ktv', model: defaultPhanCongKtv },
  { name: 'ky_thuat_vien', model: defaultKyThuatVien },
  { name: 'vai_tro', model: defaultVaiTro },
  { name: 'don_vi', model: defaultDonVi },
  { name: 'tang', model: defaultTang },
  { name: 'day', model: defaultDay },
  { name: 'phong', model: defaultPhong },
  { name: 'loai_phong', model: defaultLoaiPhong },
  { name: 'loai_thiet_bi', model: defaultLoaiThietBi },
  { name: 'chuyen_mon', model: defaultChuyenMon },
  { name: 'chuyen_mon_ktv', model: defaultChuyenMonKtv },
  { name: 'bai_viet', model: defaultBaiViet },
  { name: 'bien_ban_yeu_cau', model: defaultBienBanYeuCau },
  { name: 'chi_tiet_yeu_cau', model: defaultChiTietYeuCau },
  { name: 'anh_minh_chung_bao_cao', model: defaultAnhMinhChungBaoCao },
  { name: 'anh_minh_chung_lam_viec', model: defaultAnhMinhChungLamViec },
  { name: 'danh_gia_ktv', model: defaultDanhGiaKtv },
  { name: 'thong_bao', model: defaultThongBao },
];

const handleNormalizeAll = async () => {
  for (const item of allCollections) {
    //console.log(`📌 Chuẩn hóa ${item.name}`);
    await normalizeCollection(item.name, item.model);
  }
  setTimeout(() => {
    alert('✅ Đã chuẩn hóa toàn bộ Firestore!');
  }, 100);
  
};

export default function HomeScreen() {
  return (
    <AppLayout showBottomBar={true}>
      <View style={styles.container}>
        <Text>HOME</Text>
      </View>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
});
