from datetime import datetime, timedelta
from service.auth_service import AuthService
from service.user_service import UserService
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
import json
from typing import Dict, List
from db.db import db
from typing import Optional
from models.meeting import MeetingRequest, MeetingResponse


class MeetingService:

    collection_name = "meetings"

    @staticmethod
    async def create_google_meets(
        organizer_id: str,
        attendee_emails: list[str],
        start_time: datetime,
        duration_hours: int,
        summary: str,
        description: str = "",
    ) -> Dict:
        """Create a Google Meet event and return meeting details

        Args:
            organizer_id: User ID of the meeting organizer
            attendee_emails: List of attendee email addresses
            start_time: Start time of the meeting
            duration_hours: Duration in hours
            summary: Meeting title
            description: Meeting description

        Returns:
            Dict containing meeting details including meet link
        """
        try:
            # Get organizer's credentials and build service
            credentials_json = await AuthService.handle_credentials_refresh(
                organizer_id
            )
            credentials_dict = json.loads(credentials_json)
            credentials = Credentials.from_authorized_user_info(
                credentials_dict, scopes=AuthService.SCOPES
            )
            service = build("calendar", "v3", credentials=credentials)

            # Calculate end time
            end_time = start_time + timedelta(hours=duration_hours)

            # Create event body
            event = {
                "summary": summary,
                "description": description,
                "start": {
                    "dateTime": start_time.isoformat(),
                    "timeZone": datetime.now().astimezone().tzinfo.tzname(None),
                },
                "end": {
                    "dateTime": end_time.isoformat(),
                    "timeZone": datetime.now().astimezone().tzinfo.tzname(None),
                },
                "attendees": [{"email": email} for email in attendee_emails],
                "conferenceData": {
                    "createRequest": {
                        "requestId": f"meet_{start_time.timestamp()}",
                        "conferenceSolutionKey": {"type": "hangoutsMeet"},
                    }
                },
                "reminders": {
                    "useDefault": False,
                    "overrides": [
                        {"method": "email", "minutes": 24 * 60},
                        {"method": "popup", "minutes": 30},
                    ],
                },
            }

            # Create the event with Google Meet
            event = (
                service.events()
                .insert(
                    calendarId="primary",
                    body=event,
                    conferenceDataVersion=1,
                    sendUpdates="all",
                )
                .execute()
            )

            return {
                "id": event["id"],
                "meet_link": event.get("conferenceData", {})
                .get("entryPoints", [{}])[0]
                .get("uri", ""),
                "start": event["start"]["dateTime"],
                "end": event["end"]["dateTime"],
                "summary": event["summary"],
                "description": event.get("description", ""),
                "organizer": event["organizer"]["email"],
                "attendees": [
                    attendee["email"] for attendee in event.get("attendees", [])
                ],
            }

        except Exception as e:
            raise ValueError(f"Failed to create Google Meet: {str(e)}")

    @staticmethod
    async def create_meeting(meeting_request: MeetingRequest) -> MeetingResponse:
        # Get attendee emails
        attendee_emails = []
        for attendee_id in meeting_request.attendee_ids:
            user = await UserService.get_user_by_id(attendee_id)
            if not user:
                raise ValueError(f"User not found: {attendee_id}")
            attendee_emails.append(user.email)

        # Create Google Meet
        meeting = await MeetingService.create_google_meets(
            meeting_request.organizer_id,
            attendee_emails,
            meeting_request.start_time,
            meeting_request.duration_hours,
            meeting_request.summary,
            meeting_request.description,
        )

        # Store in database
        meeting_dict = meeting
        meeting_dict["programme_id"] = meeting_request.programme_id
        meeting_dict["organizer_id"] = meeting_request.organizer_id
        meeting_dict["duration_hours"] = meeting_request.duration_hours
        meeting_dict["attendee_ids"] = meeting_request.attendee_ids
        meeting_dict["start_time"] = meeting_request.start_time

        collection = db.get_collection(MeetingService.collection_name)
        await collection.insert_one(meeting_dict)

        return MeetingResponse(**meeting_dict)

    @staticmethod
    async def get_meeting_by_id(meeting_id: str) -> Optional[MeetingResponse]:
        collection = db.get_collection(MeetingService.collection_name)
        meeting = await collection.find_one({"id": meeting_id})
        if meeting:
            return MeetingResponse(**meeting)
        return None

    @staticmethod
    async def get_meetings(
        programme_id: Optional[str] = None,
        organizer_id: Optional[str] = None,
    ) -> List[MeetingResponse]:
        filter_query = {}
        if programme_id:
            filter_query["programme_id"] = programme_id
        if organizer_id:
            filter_query["organizer_id"] = organizer_id

        meetings = []
        cursor = db.get_collection(MeetingService.collection_name).find(filter_query)
        async for meeting in cursor:
            meetings.append(MeetingResponse(**meeting))
        return meetings

    # @staticmethod
    # async def save_meeting_transcript(meeting_id: str):
    #     # Get transcript from meetings account's google drive
    #     # Save transcript to via meeting_id in db
    #     collection = db.get_collection(MeetingService.collection_name)
    #     meeting = await collection.find_one({"id": meeting_id})
    #     if not meeting:
    #         raise ValueError("Meeting not found")
    #     transcript = await MeetingService.get_transcript(meeting["id"])
    #     await collection.update_one({"id": meeting_id}, {"$set": {"transcript": transcript}})
    #     return

    # @staticmethod
    # async def get_transcript(meeting_id: str):
    #     # Get transcript from meetings account's google drive
    #     # Save transcript to via meeting_id in db
    #     pass
