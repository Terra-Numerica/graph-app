const API_BASE_URL = '/api/meli-melo';

export const fetchMeliMelos = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}`);
        return response.json();
    } catch (error) {
        console.error(`Error fetching meli-melos: ${error}`);
    }
};

export const fetchMeliMelo = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        return response.json();
    } catch (error) {
        console.error(`Error fetching meli-melo: ${error}`);
    }
};

export const createMeliMelo = async (meliMelo) => {
    try {
        const response = await fetch(`${API_BASE_URL}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(meliMelo),
        });
        return response.json();
    } catch (error) {
        console.error(`Error creating meli-melo: ${error}`);
    }
};

export const updateMeliMelo = async (id, meliMelo) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(meliMelo),
        });
        return response.json();
    } catch (error) {
        console.error(`Error updating meli-melo: ${error}`);
    }
};

export const deleteMeliMelo = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE',
        });
        return response.json();
    } catch (error) {
        console.error(`Error deleting meli-melo: ${error}`);
    }
};