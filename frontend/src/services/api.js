import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// GET all hardcoded maps
export const getAllProgrammes = () => {
  return api
    .get("/programmes")
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      throw error;
    });
};

export const getUsers = () => {
  return api
    .get("/users")
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      throw error;
    });
};

export const getUserById = (userId) => {
  const queryParams = {
    user_id: userId,
  };

  return api
    .get("/users", { params: queryParams })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      throw error;
    });
};

export const getMeetings = (programmeID) => {
  return api
    .get("/meetings", {
      params: {
        programme_id: programmeID,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      throw error;
    });
};

export const createMeetings = (meetingData) => {
  return api
    .post("/meetings")
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error creating meeting:", error);
      throw error;
    });
};

export const createNewTask = (taskData) => {
  return api
    .post("/tasks", taskData)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      throw error;
    });
};

export const getEmailsShortSum = (userId) => {
  return api
    .get(`/emails/with_short_summary/${userId}`)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      throw error;
    });
};

export const getEmailsLongSum = (userId, emailId) => {
  const queryParams = {
    user_id: userId,
    email_id: emailId,
  };

  return api
    .get(`/emails/${userId}/${emailId}/long_summary`, { params: queryParams })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      throw error;
    });
};
