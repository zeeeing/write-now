import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  DatePicker,
  Textarea,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";
import { now, getLocalTimeZone } from "@internationalized/date";
import { createNewMeeting, getUsersWithoutCredentials } from "../services/api";
import { useNavigate } from "react-router-dom";

export const CreateMeetingModal = ({ isOpen, onClose, id, attendees }) => {
  const [startTime, setStartTime] = useState(new Date());
  const [durationHours, setDurationHours] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const allIds = Object.values(attendees).flat();

  const filteredUsers = users.filter((user) => allIds.includes(user.id));

  const handleSubmit = () => {
    const { year, month, day, hour, minute, second, millisecond, offset } =
      startTime;
    const date = new Date(
      Date.UTC(year, month - 1, day, hour, minute, second, millisecond)
    );
    const adjustedDate = new Date(date.getTime() - offset);
    const isoDate = adjustedDate.toISOString();
    const userId = localStorage.getItem("userId");
    const array = Array.from(selectedUsers);

    const meetingData = {
      programme_id: id,
      organizer_id: userId,
      attendee_ids: array,
      start_time: isoDate,
      duration_hours: durationHours,
      summary: summary,
      description: description,
    };
    console.log(meetingData);
    createNewMeeting(meetingData);
    navigate(0);
    onClose();
  };
  const handleSelectionChange = (selectedKeys) => {
    setSelectedUsers(selectedKeys);
  };
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getUsersWithoutCredentials();
      setUsers(response);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Modal isOpen={isOpen} size={"md"} onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Create Meeting
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <div>
                  <Textarea
                    isRequired
                    label="Title"
                    labelPlacement="outside"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Enter meeting summary"
                  />
                </div>
                <div>
                  <Textarea
                    isRequired
                    label="Description"
                    labelPlacement="outside"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter meeting description"
                    rows={4}
                  />
                </div>
                <div>
                  <DatePicker
                    isRequired
                    label="Start Time"
                    labelPlacement="outside"
                    hideTimeZone
                    showMonthAndYearPickers
                    defaultValue={now(getLocalTimeZone())}
                    aria-label="Event Date"
                    selected={startTime}
                    onChange={(date) => setStartTime(date)}
                    showTimeSelect
                    dateFormat="Pp"
                    className="heroui-input"
                  />
                </div>
                <div>
                  <Input
                    isRequired
                    label="Duration (hours)"
                    labelPlacement="outside"
                    type="number"
                    value={durationHours}
                    onChange={(e) => setDurationHours(e.target.value)}
                    placeholder="Enter duration in hours"
                  />
                </div>
                <div>
                  <Select
                    isRequired
                    label="Select attendees"
                    labelPlacement="outside"
                    placeholder="Select attendee/s"
                    selectionMode="multiple"
                    selectedKeys={selectedUsers}
                    onSelectionChange={handleSelectionChange}
                  >
                    {filteredUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button auto flat color="error" onPress={onClose}>
                Close
              </Button>
              <Button auto onPress={handleSubmit}>
                Create Meeting
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
