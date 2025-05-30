import { db } from './firebaseConfig';
import {
    collection, getDocs, query, where
} from 'firebase/firestore';

export async function getPhongByDonVi(donViId) {
    const phongSnap = await getDocs(
        query(collection(db, 'phong'), where('donViId', '==', donViId))
    );
    const phongList = phongSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const daySnap = await getDocs(collection(db, 'day'));
    const dayMap = Object.fromEntries(daySnap.docs.map(doc => [doc.id, doc.data().tenDay]));

    const tangSnap = await getDocs(collection(db, 'tang'));
    const tangMap = Object.fromEntries(tangSnap.docs.map(doc => [doc.id, doc.data().tenTang]));

    const thietBiSnap = await getDocs(collection(db, 'thiet_bi'));
    const thietBiPhongMap = {};
    thietBiSnap.docs.forEach(doc => {
        const tb = doc.data();
        if (tb.phongId) {
            thietBiPhongMap[tb.phongId] = (thietBiPhongMap[tb.phongId] || 0) + 1;
        }
    });

    return phongList.map(p => ({
        id: p.id,
        tenPhong: p.tenPhong,
        tenDay: dayMap[p.dayId] || 'N/A',
        tenTang: tangMap[p.tangId] || 'N/A',
        soLuongThietBi: thietBiPhongMap[p.id] || 0,
    }));


}



export async function getAllDay() {
    const snap = await getDocs(collection(db, 'day'));
    return snap.docs.map(doc => ({ id: doc.id, tenDay: doc.data().tenDay }));
}

export async function getAllTang() {
    const snap = await getDocs(collection(db, 'tang'));
    return snap.docs.map(doc => ({ id: doc.id, tenTang: doc.data().tenTang }));
}