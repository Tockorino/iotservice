import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase.js';
import Modal from 'react-modal';

import './App.css';

function App() {
  const [dailyVisits, setDailyVisits] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [todayVisit, setTodayVisit] = useState(null);
  const [editingNote, setEditingNote] = useState(null);

  useEffect(() => {
    const fetchDailyVisits = async () => {
      try {
        const dailyVisitsCollection = collection(db, 'DailyVisits');
        const snapshot = await getDocs(dailyVisitsCollection);

        const visitsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setDailyVisits(visitsData);

        // Filtrer les visites d'aujourd'hui
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const todayVisit = visitsData.find(
            (visit) => visit.date.seconds * 1000 >= startOfDay.getTime() && visit.date.seconds * 1000 < endOfDay.getTime()
        );

        setTodayVisit(todayVisit);
      } catch (error) {
        console.error('Erreur lors de la récupération des visites :', error);
      }
    };

    fetchDailyVisits().then(r => console.log(r));
  }, []);

  const handleShowHistory = () => {
    setShowHistory(true);
  };

  const handleCloseHistory = () => {
    setShowHistory(false);
    setEditingNote(null); // Réinitialiser l'état d'édition lorsque le modal est fermé
  };

  const handleEditNote = (visitId) => {
    setEditingNote(visitId);
  };

  const handleSaveNote = async (visitId, newNote) => {
    try {
      // Mettez à jour la note dans la base de données
      const visitRef = doc(db, 'DailyVisits', visitId);
      await updateDoc(visitRef, { note: newNote });

      console.log(`Sauvegarde de la note ${newNote} pour la visite ${visitId}`);
      setEditingNote(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la note dans la base de données :', error);
    }
  };

  return (
      <div>
        <div className="header">
          <div className="logo-background">
            <img src="https://www.leuzesports.com/images/upload/655-logosite-1.png" alt="Logo" className="logo" />
          </div>
          <div className="text-container">
            <h1>Data</h1>
          </div>
        </div>

        <div className="information">
          {todayVisit ? (
              <ul>
                <li key={todayVisit.id}>
                            <span>
                                Date: {new Date(todayVisit.date?.seconds * 1000).toLocaleString()}, Personnes présentes: {todayVisit.numberOfPeople}, Notes: {todayVisit.note}
                              {todayVisit.id === editingNote && (
                                  <>
                                    <input
                                        type="text"
                                        value={todayVisit.note}
                                        onChange={(e) => setTodayVisit({ ...todayVisit, note: e.target.value })}
                                    />
                                    <button onClick={() => handleSaveNote(todayVisit.id, todayVisit.note)}>Enregistrer</button>
                                  </>
                              )}
                              {!editingNote && (
                                  <button onClick={() => handleEditNote(todayVisit.id)}>Modifier la note</button>
                              )}
                            </span>
                </li>
              </ul>
          ) : (
              <p>Aucune donnée actuellement.</p>
          )}
          <button className="historic-button" onClick={handleShowHistory}>
            Consulter l'historique
          </button>

          <Modal
              isOpen={showHistory}
              onRequestClose={handleCloseHistory}
              contentLabel="Historique des visites"
              appElement={document.getElementById('root')}
          >
            <h2>Historique des visites</h2>
            <ul style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {dailyVisits.map((visit) => (
                  <li key={visit.id}>
                                <span>
                                    Date: {new Date(visit.date?.seconds * 1000).toLocaleString()}, Personnes présentes: {visit.numberOfPeople}, Notes: {visit.note}
                                  {visit.id === editingNote && (
                                      <>
                                        <input
                                            type="text"
                                            value={visit.note}
                                            onChange={(e) => setDailyVisits(dailyVisits.map(v => v.id === visit.id ? { ...v, note: e.target.value } : v))}
                                        />
                                        <button className="save-button" onClick={() => handleSaveNote(visit.id, visit.note)}>Enregistrer</button>
                                      </>
                                  )}
                                  {!editingNote && (
                                      <button className="edit-button" onClick={() => handleEditNote(visit.id)}>Modifier la note</button>
                                  )}
                                </span>
                  </li>
              ))}
            </ul>
            <button className="historic-button" onClick={handleCloseHistory}>Fermer</button>
          </Modal>
        </div>
      </div>
  );
}

export default App;