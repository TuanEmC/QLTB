import { useState, useEffect, useMemo } from 'react';
import { getDevicesByDonVi, getAllDevicesForAdmin } from '../services/deviceService';

export default function useDeviceListViewModel({ isAdmin = false, donViId = null }) {
    const [devices, setDevices] = useState([]);
    const [filters, setFilters] = useState({
        day: null,
        tang: null,
        phong: null,
        trangThai: null,
        loaiThietBi: null,
    });

    useEffect(() => {
        (async () => {
            try {
                const result = isAdmin
                    ? await getAllDevicesForAdmin()
                    : await getDevicesByDonVi(donViId);
                setDevices(result);
            } catch (e) {
                console.error('❌ Lỗi tải thiết bị:', e);
            }
        })();
    }, [isAdmin, donViId]);

    const filteredDevices = useMemo(() => {
        return devices.filter((item) =>
            (!filters.day || item.tenDay === filters.day) &&
            (!filters.tang || item.tenTang === filters.tang) &&
            (!filters.phong || item.tenPhong === filters.phong) &&
            (!filters.trangThai || item.trangThai === filters.trangThai) &&
            (!filters.loaiThietBi || item.tenLoai === filters.loaiThietBi)
        );
    }, [devices, filters]);

    const resetFilters = () => setFilters({
        day: null,
        tang: null,
        phong: null,
        trangThai: null,
        loaiThietBi: null,
    });

    return { devices: filteredDevices, setFilters, filters, resetFilters };
}



// import { useState, useEffect, useMemo } from 'react';
// import { getDevicesByDonVi } from '../services/deviceService';

// export default function useDeviceListViewModel(donViId) {

//     const [devices, setDevices] = useState([]);
//     const [filters, setFilters] = useState({
//         day: null,
//         tang: null,
//         phong: null,
//         trangThai: null,
//         loaiThietBi: null,
//     });

//     useEffect(() => {
//         if (donViId) {
//             (async () => {
//                 try {
//                     const devices = await getDevicesByDonVi(donViId);
//                     setDevices(devices);
//                 } catch (e) {
//                 }
//             })();
//         }
//     }, [donViId]);



//     const filteredDevices = useMemo(() => {
//         return devices.filter((item) =>
//             (!filters.day || item.tenDay === filters.day) &&
//             (!filters.tang || item.tenTang === filters.tang) &&
//             (!filters.phong || item.tenPhong === filters.phong) &&
//             (!filters.trangThai || item.trangThai === filters.trangThai) &&
//             (!filters.loaiThietBi || item.tenLoai === filters.loaiThietBi)
//         );
//     }, [devices, filters]);

//     const resetFilters = () => setFilters({
//         day: null,
//         tang: null,
//         phong: null,
//         trangThai: null,
//         loaiThietBi: null,
//     });

//     return { devices: filteredDevices, setFilters, filters, resetFilters };
// }
