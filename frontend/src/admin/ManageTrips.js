import React, { useState, useEffect } from "react";
import axios from "axios";
import API from "../api/axiosInstance";

function ManageTrips() {

    const [trips, setTrips] = useState([]);

    const [form, setForm] = useState({
        title: "",
        location: "",
        price: "",
        duration: ""
    });


    /* ---------------- FETCH TRIPS ---------------- */

    const fetchTrips = async () => {

        try {

            const res = await API.get/delete("/api/admin/trips...");

            setTrips(res.data);

        } catch (error) {

            console.log("Error fetching trips", error);

        }

    };


    /* ---------------- LOAD TRIPS ON PAGE LOAD ---------------- */

    useEffect(() => {

        fetchTrips();

    }, []);


    /* ---------------- HANDLE INPUT ---------------- */

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    };


    /* ---------------- ADD TRIP ---------------- */

    const addTrip = async () => {

        try {

            await API.post("/api/admin/trips...", form);

            fetchTrips();

        } catch (error) {

            console.log("Error adding trip", error);

        }

    };


    /* ---------------- DELETE TRIP ---------------- */

    const deleteTrip = async (id) => {

        try {

            await API.delete("/api/admin/trips...");

            fetchTrips();

        } catch (error) {

            console.log("Error deleting trip", error);

        }

    };


    /* ---------------- UI ---------------- */

    return (

        <div>

            <h2>Manage Trips</h2>


            <h3>Add Trip</h3>

            <input name="title" placeholder="Title" onChange={handleChange} />

            <input name="location" placeholder="Location" onChange={handleChange} />

            <input name="price" placeholder="Price" onChange={handleChange} />

            <input name="duration" placeholder="Duration" onChange={handleChange} />

            <button onClick={addTrip}>Add Trip</button>


            <hr />


            <h3>All Trips</h3>

            {trips.map((trip) => (

                <div key={trip._id}>

                    <h4>{trip.title}</h4>

                    <p>{trip.location}</p>

                    <p>₹{trip.price}</p>

                    <p>{trip.duration}</p>

                    <button onClick={() => deleteTrip(trip._id)}>
                        Delete
                    </button>

                </div>

            ))}

        </div>

    );

}

export default ManageTrips;