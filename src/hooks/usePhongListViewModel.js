import { useState } from 'react';
import { getPhongByDonVi } from '../services/phongService';

export default function usePhongListViewModel() {
    const [phongList, setPhongList] = useState([]);
    const [allPhong, setAllPhong] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadPhongList = async (donViId) => {
        setIsLoading(true);
        try {
            const list = await getPhongByDonVi(donViId);
            setAllPhong(list);
            setPhongList(list); // mặc định là toàn bộ
        } catch (e) {
            console.error('❌ Lỗi load phòng:', e);
        } finally {
            setIsLoading(false);
        }
    };

    const filterPhongList = (dayId, tangId) => {
        setPhongList(
            allPhong.filter(p =>
                (!dayId || p.dayId === dayId) &&
                (!tangId || p.tangId === tangId)
            )
        );
    };

    return {
        phongList,
        allPhong, // 👈 THÊM DÒNG NÀY
        isLoading,
        loadPhongList,
        setPhongList
    };

}

