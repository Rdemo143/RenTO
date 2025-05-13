import React, { useEffect, useState } from "react";
import { fetchProperties } from "../api/property";
import PropertyCard from "../components/PropertyCard";

const PropertyList = () => {
    const [properties, setProperties] = useState([]);

    useEffect(() => {
        fetchProperties().then(setProperties).catch(console.error);
    }, []);

    return (
        <div className="container mt-4">
            <h3>Available Properties</h3>
            <div className="row">
                {properties.map((property) => (
                    <div className="col-md-4 mb-3" key={property._id}>
                        <PropertyCard property={property} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PropertyList;