import {db} from '../firebase';
import {addDoc, collection, getDocs, orderBy, query, serverTimestamp, where} from 'firebase/firestore';

export const Report = {
    // Get all active reports from Firebase
    async getActiveReports() {
        try {
            const reportsRef = collection(db, 'reports');
            const fifteenMinutesAgo = Date.now() - (15 * 60 * 1000);

            // Query for reports newer than 15 minutes
            const q = query(
                reportsRef,
                where('timestamp', '>', fifteenMinutesAgo),
                orderBy('timestamp', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const reports = [];

            querySnapshot.forEach((doc) => {
                reports.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return reports;
        } catch (error) {
            console.error('Error getting reports from Firebase:', error);
            return [];
        }
    },

    // Add a new report to Firebase
    async addReport(reportData, userLocation) {
        try {
            const reportsRef = collection(db, 'reports');

            const newReport = {
                busNumber: reportData.busNumber,
                direction: reportData.direction,
                location: userLocation || {lat: 32.0853, lng: 34.7818},
                timestamp: Date.now(),
                createdAt: serverTimestamp()
            };

            const docRef = await addDoc(reportsRef, newReport);

            return {
                id: docRef.id,
                ...newReport
            };
        } catch (error) {
            console.error('Error adding report to Firebase:', error);
            throw error;
        }
    },
};