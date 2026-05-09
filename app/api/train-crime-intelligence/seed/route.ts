import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/config/dbConnect";
import TrainCrimeIntelligence from "@/models/TrainCrimeIntelligence";

type RmComplaint = {
  subHead: string;
  placeOfOccurrence: string;
  dateOfComplaint: string;
};

const RM_COMPLAINT_DATA: { [trainNo: string]: RmComplaint[] } = {
  "16188": [
    {
      subHead: "Unauthorized person in Ladies coach",
      placeOfOccurrence: "F/Ladies",
      dateOfComplaint: "02.01.25",
    },
    {
      subHead: "Nuisance by Beggar",
      placeOfOccurrence: "S2/39",
      dateOfComplaint: "28.09.25",
    },
  ],
  "12637": [
    {
      subHead: "Smoking",
      placeOfOccurrence: "F/GS",
      dateOfComplaint: "02.01.25",
    },
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "S7/49",
      dateOfComplaint: "15.09.25",
    },
  ],
  "20691": [
    {
      subHead: "Harassment by Security Personnel",
      placeOfOccurrence: "GS",
      dateOfComplaint: "03.01.25",
    },
    {
      subHead: "Theft of Passengers Belongings/Snatching",
      placeOfOccurrence: "R/GS",
      dateOfComplaint: "13.06.25",
    },
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "GS",
      dateOfComplaint: "19.10.2025",
    },
  ],
  "20605": [
    {
      subHead: "Unauthorized person in Disabled Coach",
      placeOfOccurrence: "F/Disabled Coach",
      dateOfComplaint: "04.01.25",
    },
    {
      subHead: "Unauthorized person in Disabled Coach",
      placeOfOccurrence: "R/Disabled",
      dateOfComplaint: "10.05.25",
    },
    {
      subHead: "Theft of Passengers Belongings/Snatching",
      placeOfOccurrence: "",
      dateOfComplaint: "16.07.25",
    },
    {
      subHead: "Unauthorized person in Ladies Coach",
      placeOfOccurrence: "F/Ladies coach",
      dateOfComplaint: "28.07.25",
    },
  ],
  "22613": [
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "S3/1",
      dateOfComplaint: "06.01.25",
    },
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "S4",
      dateOfComplaint: "13.01.25",
    },
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "S4",
      dateOfComplaint: "07.04.25",
    },
  ],
  "56802": [
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "GS",
      dateOfComplaint: "09.01.25",
    },
  ],
  "16159": [
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "S4/51",
      dateOfComplaint: "10.01.25",
    },
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "S4",
      dateOfComplaint: "16.03.25",
    },
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "S4",
      dateOfComplaint: "16.03.25",
    },
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "S6",
      dateOfComplaint: "16.04.25",
    },
  ],
  "16127": [
    {
      subHead: "Misbehaviour",
      placeOfOccurrence: "R/Disabled",
      dateOfComplaint: "13.01.25",
    },
  ],
  "16232": [
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "S8",
      dateOfComplaint: "15.01.25",
    },
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "S8",
      dateOfComplaint: "29.03.25",
    },
  ],
  "16187": [
    {
      subHead: "Others",
      placeOfOccurrence: "R/Disabled",
      dateOfComplaint: "16.01.25",
    },
    {
      subHead: "Unauthorized person in Ladies Coach",
      placeOfOccurrence: "F/Ladies Coach",
      dateOfComplaint: "31.01.25",
    },
    {
      subHead: "Overcharging",
      placeOfOccurrence: "",
      dateOfComplaint: "25.02.25",
    },
    {
      subHead: "Nuisance by Hawkers",
      placeOfOccurrence: "B1",
      dateOfComplaint: "15.04.25",
    },
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "B1",
      dateOfComplaint: "16.04.25",
    },
    {
      subHead: "Unauthorized person in Ladies Coach",
      placeOfOccurrence: "",
      dateOfComplaint: "15.06.25",
    },
    {
      subHead: "Drinking Alcohol",
      placeOfOccurrence: "S9",
      dateOfComplaint: "03.07.25",
    },
    {
      subHead: "Theft of Passengers Belongings/Snatching",
      placeOfOccurrence: "S7",
      dateOfComplaint: "16.07.25",
    },
    {
      subHead: "Unauthorized person in Disabled Coach",
      placeOfOccurrence: "R/Disabled coach",
      dateOfComplaint: "17.08.25",
    },
    { subHead: "Smoking", placeOfOccurrence: "", dateOfComplaint: "18.08.25" },
    {
      subHead: "Theft of Passengers Belongings (Snatching)",
      placeOfOccurrence: "R/GS",
      dateOfComplaint: "02.09.25",
    },
  ],
  "16615": [
    {
      subHead: "Unauthorized person in Disabled Coach",
      placeOfOccurrence: "F/Disabled Coach",
      dateOfComplaint: "19.01.25",
    },
    { subHead: "Others", placeOfOccurrence: "S7", dateOfComplaint: "15.05.25" },
    {
      subHead: "Unauthorized person in Disabled Coach",
      placeOfOccurrence: "",
      dateOfComplaint: "31.08.25",
    },
  ],
  "22628": [
    {
      subHead: "Unauthorized person in Ladies Coach",
      placeOfOccurrence: "Ladis Coach",
      dateOfComplaint: "20.01.25",
    },
  ],
  "12663": [
    {
      subHead: "Theft of Passenger Belonging",
      placeOfOccurrence: "B6",
      dateOfComplaint: "25.01.25",
    },
    {
      subHead: "Theft of Passenger Belonging",
      placeOfOccurrence: "B6",
      dateOfComplaint: "25.01.25",
    },
  ],
  "12633": [
    { subHead: "Others", placeOfOccurrence: "S3", dateOfComplaint: "27.01.25" },
    {
      subHead: "Nuisance by Beggar",
      placeOfOccurrence: "S3",
      dateOfComplaint: "27.01.25",
    },
    {
      subHead: "Smoking/Drinking Alcohol/Narcotics",
      placeOfOccurrence: "F/GS",
      dateOfComplaint: "23.02.25",
    },
    {
      subHead: "Smoking",
      placeOfOccurrence: "F/GS",
      dateOfComplaint: "25.02.25",
    },
    {
      subHead: "Unauthorized person in Disabled Coach",
      placeOfOccurrence: "",
      dateOfComplaint: "",
    },
    { subHead: "Smoking", placeOfOccurrence: "", dateOfComplaint: "13.07.25" },
    {
      subHead: "Misbehaviour with lady passenger",
      placeOfOccurrence: "A1",
      dateOfComplaint: "10.09.25",
    },
    {
      subHead: "Misbehaviour with lady passenger",
      placeOfOccurrence: "A1",
      dateOfComplaint: "10.09.25",
    },
    {
      subHead: "Nuisance by Beggar",
      placeOfOccurrence: "F/GS",
      dateOfComplaint: "22.09.25",
    },
  ],
  "12868": [
    {
      subHead: "Unauthorized person in Ladies Coach",
      placeOfOccurrence: "GS",
      dateOfComplaint: "29.01.25",
    },
    {
      subHead: "Unauthorized person in Ladies Coach",
      placeOfOccurrence: "GS",
      dateOfComplaint: "29.01.25",
    },
  ],
  "12664": [
    {
      subHead: "Theft of Passenger Belonging",
      placeOfOccurrence: "GS",
      dateOfComplaint: "31.01.25",
    },
    {
      subHead: "Theft of Passenger Belonging",
      placeOfOccurrence: "GS",
      dateOfComplaint: "31.01.25",
    },
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "R/GS",
      dateOfComplaint: "21.03.25",
    },
  ],
  "16780": [
    { subHead: "Others", placeOfOccurrence: "S6", dateOfComplaint: "31.01.25" },
  ],
  "12606": [
    {
      subHead: "Nuisance by Eunuch",
      placeOfOccurrence: "D13",
      dateOfComplaint: "02.02.25",
    },
    { subHead: "Others", placeOfOccurrence: "D2", dateOfComplaint: "21.04.25" },
    {
      subHead: "Unauthorized person in Disabled Coach",
      placeOfOccurrence: "R/Disabled",
      dateOfComplaint: "06.10.2025",
    },
  ],
  "6184": [
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "S4",
      dateOfComplaint: "08.02.25",
    },
  ],
  "12083": [
    {
      subHead: "Drinking Alcohol",
      placeOfOccurrence: "D16/88",
      dateOfComplaint: "12.02.25",
    },
  ],
  "20636": [
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "S9",
      dateOfComplaint: "13.02.25",
    },
    {
      subHead: "Unauthorized person in Disabled Coach",
      placeOfOccurrence: "F/Disabled",
      dateOfComplaint: "14.05.25",
    },
  ],
  "76826": [
    {
      subHead: "Unauthorized person in Ladies Coach",
      placeOfOccurrence: "R/Ladies coach",
      dateOfComplaint: "16.02.25",
    },
  ],
  "20498": [
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "R/GS",
      dateOfComplaint: "17.02.25",
    },
  ],
  "22657": [
    {
      subHead: "Others",
      placeOfOccurrence: "SE/1",
      dateOfComplaint: "17.02.25",
    },
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "S2",
      dateOfComplaint: "27.03.25",
    },
    {
      subHead: "Nuisance by Eunuch",
      placeOfOccurrence: "R/GS",
      dateOfComplaint: "14.04.25",
    },
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "S3",
      dateOfComplaint: "14.08.25",
    },
  ],
  "16368": [
    {
      subHead: "Misbehaviour with lady passenger",
      placeOfOccurrence: "GS",
      dateOfComplaint: "18.02.25",
    },
  ],
  "12642": [
    {
      subHead: "Smoking/Drinking Alcohol/Narcotics",
      placeOfOccurrence: "S3",
      dateOfComplaint: "02.03.25",
    },
  ],
  "12634": [
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "S2",
      dateOfComplaint: "03.02.25",
    },
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "B3/67",
      dateOfComplaint: "04.10.2025",
    },
  ],
  "16616": [
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "S4",
      dateOfComplaint: "05.03.25",
    },
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "S3",
      dateOfComplaint: "13.04.25",
    },
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "S4",
      dateOfComplaint: "18.04.25",
    },
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "S8",
      dateOfComplaint: "11.07.25",
    },
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "S5",
      dateOfComplaint: "14.07.25",
    },
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "",
      dateOfComplaint: "14.07.25",
    },
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "F/GS",
      dateOfComplaint: "02.09.25",
    },
  ],
  "16128": [
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "S1/60",
      dateOfComplaint: "09.03.25",
    },
    {
      subHead: "Harassment by Security Personnel",
      placeOfOccurrence: "F/GS",
      dateOfComplaint: "07.07.25",
    },
  ],
  "01006": [
    {
      subHead: "Theft of Passengers Belongings/Snatching",
      placeOfOccurrence: "F/GS",
      dateOfComplaint: "09.03.25",
    },
  ],
  "16102": [
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "S/10",
      dateOfComplaint: "02.04.25",
    },
  ],
  "16231": [
    {
      subHead: "Unauthorized person in Reserve Army Coach",
      placeOfOccurrence: "Army alloted coach",
      dateOfComplaint: "04.04.25",
    },
    {
      subHead: "Smoking",
      placeOfOccurrence: "F/GS",
      dateOfComplaint: "18.04.25",
    },
    {
      subHead: "Others (Stone pelting)",
      placeOfOccurrence: "S6",
      dateOfComplaint: "12.08.25",
    },
    {
      subHead: "Unauthorized person in Disabled Coach",
      placeOfOccurrence: "F/Disabled coach",
      dateOfComplaint: "02.10.2025",
    },
    {
      subHead: "Others",
      placeOfOccurrence: "F/GS",
      dateOfComplaint: "22.11.2025",
    },
  ],
  "20914": [
    {
      subHead: "Unauthorized person in Disabled Coach",
      placeOfOccurrence: "R/Disabled",
      dateOfComplaint: "14.04.25",
    },
  ],
  "22658": [
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "S6/7",
      dateOfComplaint: "15.04.25",
    },
  ],
  "20635": [
    {
      subHead: "Unauthorized person in Ladies coach",
      placeOfOccurrence: "R/Ladies coach",
      dateOfComplaint: "20.04.25",
    },
    {
      subHead: "Unauthorized person in Disabled Coach",
      placeOfOccurrence: "F/Disabled",
      dateOfComplaint: "16.05.25",
    },
    {
      subHead: "Unauthorized person in Ladies Coach",
      placeOfOccurrence: "F/Ladies coach",
      dateOfComplaint: "29.07.25",
    },
  ],
  "56831": [
    {
      subHead: "Nuisance by Eunuch",
      placeOfOccurrence: "GS",
      dateOfComplaint: "23.04.25",
    },
  ],
  "16160": [
    { subHead: "Others", placeOfOccurrence: "--", dateOfComplaint: "26.04.25" },
    {
      subHead: "Nuisance by Hawker",
      placeOfOccurrence: "S3",
      dateOfComplaint: "04.05.25",
    },
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "",
      dateOfComplaint: "04.08.25",
    },
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "",
      dateOfComplaint: "09.08.25",
    },
    {
      subHead: "Unauthorized person in Ladies Coach",
      placeOfOccurrence: "R/Ladies coach",
      dateOfComplaint: "04.09.25",
    },
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "S4/07",
      dateOfComplaint: "18.10.2025",
    },
  ],
  "20682": [
    {
      subHead: "Unauthorized person in Ladies Coach",
      placeOfOccurrence: "",
      dateOfComplaint: "04.05.25",
    },
  ],
  "16795": [
    {
      subHead: "Nuisance by Hawker",
      placeOfOccurrence: "F/GS",
      dateOfComplaint: "06.05.25",
    },
  ],
  "16751": [
    {
      subHead: "Unauthorized person in Disabled Coach",
      placeOfOccurrence: "F/Disabled",
      dateOfComplaint: "11.05.25",
    },
  ],
  "20671": [
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "C1",
      dateOfComplaint: "15.05.25",
    },
  ],
  "17316": [
    {
      subHead: "Drinking Alcohol",
      placeOfOccurrence: "S3",
      dateOfComplaint: "21.05.25",
    },
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "S3",
      dateOfComplaint: "13.08.25",
    },
    {
      subHead: "Unauthorized person in Ladies Coach",
      placeOfOccurrence: "R/Ladies coach",
      dateOfComplaint: "03.09.25",
    },
  ],
  "20850": [
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "B1",
      dateOfComplaint: "01.06.25",
    },
  ],
  "12635": [
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "F/GS",
      dateOfComplaint: "02.06.25",
    },
    {
      subHead: "Nuisance by Eunuch",
      placeOfOccurrence: "D7",
      dateOfComplaint: "19.06.25",
    },
  ],
  "12682": [
    {
      subHead: "Unauthorized person in Ladies Coach",
      placeOfOccurrence: "F/Ladies",
      dateOfComplaint: "06.06.25",
    },
  ],
  "07436": [
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "S13",
      dateOfComplaint: "08.06.25",
    },
  ],
  "06191": [
    { subHead: "Others", placeOfOccurrence: "", dateOfComplaint: "13.06.25" },
  ],
  "16847": [
    {
      subHead: "Unauthorized person in Ladies Coach",
      placeOfOccurrence: "F/GS",
      dateOfComplaint: "17.06.25",
    },
    {
      subHead: "Unauthorized person in Ladies Coach",
      placeOfOccurrence: "F/GS",
      dateOfComplaint: "29.12.2025",
    },
    {
      subHead: "Unauthorized person in Ladies Coach",
      placeOfOccurrence: "F/GS",
      dateOfComplaint: "29.12.2025",
    },
  ],
  "16352": [
    { subHead: "Others", placeOfOccurrence: "B2", dateOfComplaint: "19.06.25" },
  ],
  "12690": [
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "F/GS",
      dateOfComplaint: "14.07.25",
    },
  ],
  "12641": [
    {
      subHead: "Theft of Passengers Belongings/Snatching",
      placeOfOccurrence: "",
      dateOfComplaint: "17.07.25",
    },
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "S7/42",
      dateOfComplaint: "16.10.2025",
    },
  ],
  "20672": [
    { subHead: "Others", placeOfOccurrence: "C6", dateOfComplaint: "21.07.25" },
  ],
  "12631": [
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "F/GS",
      dateOfComplaint: "07.08.25",
    },
    {
      subHead: "Unauthorized person in Disabled Coach",
      placeOfOccurrence: "F/Disabled coach",
      dateOfComplaint: "08.11.2025",
    },
  ],
  "12661": [
    {
      subHead: "Unauthorized person in Disabled Coach",
      placeOfOccurrence: "F/Disabled",
      dateOfComplaint: "15.08.25",
    },
  ],
  "16362": [
    {
      subHead: "Unauthorized person in Ladies Coach",
      placeOfOccurrence: "F/GS",
      dateOfComplaint: "17.08.25",
    },
  ],
  "16353": [
    {
      subHead: "Theft of Passengers Belongings/Snatching",
      placeOfOccurrence: "S10",
      dateOfComplaint: "25.08.25",
    },
    {
      subHead: "Others",
      placeOfOccurrence: "GS",
      dateOfComplaint: "08.12.2025",
    },
    {
      subHead: "Others",
      placeOfOccurrence: "GS",
      dateOfComplaint: "08.12.2025",
    },
  ],
  "22661": [
    {
      subHead: "Others",
      placeOfOccurrence: "F/GS",
      dateOfComplaint: "27.08.25",
    },
  ],
  "22627": [
    {
      subHead: "Unauthorized person in Disabled Coach",
      placeOfOccurrence: "",
      dateOfComplaint: "31.08.25",
    },
  ],
  "12654": [
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "B1/59",
      dateOfComplaint: "10.09.25",
    },
  ],
  "16351": [
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "F/GS",
      dateOfComplaint: "10.09.25",
    },
  ],
  "20606": [
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "",
      dateOfComplaint: "12.09.25",
    },
  ],
  "22662": [
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "S3/22",
      dateOfComplaint: "15.09.25",
    },
  ],
  "12694": [
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "",
      dateOfComplaint: "27.09.25",
    },
  ],
  "12867": [
    {
      subHead: "Others",
      placeOfOccurrence: "M2/38",
      dateOfComplaint: "30.09.25",
    },
  ],
  "12652": [
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "B2/71",
      dateOfComplaint: "26.11.2025",
    },
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "B2/71",
      dateOfComplaint: "26.11.2025",
    },
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "A1/20",
      dateOfComplaint: "26.11.2025",
    },
  ],
  "16192": [
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "GS",
      dateOfComplaint: "06.12.2025",
    },
  ],
  "16779": [
    {
      subHead: "Theft of Passengers Belongings",
      placeOfOccurrence: "S9/71",
      dateOfComplaint: "09.12.2025",
    },
  ],
  "22497": [
    {
      subHead: "Miscellaneous",
      placeOfOccurrence: "B1/41",
      dateOfComplaint: "25.12.2025",
    },
    {
      subHead: "Miscellaneous",
      placeOfOccurrence: "B1/41",
      dateOfComplaint: "25.12.2025",
    },
  ],
};

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.SEED_SECRET) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    await connectDB();

    let updated = 0;
    let created = 0;

    for (const [trainNo, complaints] of Object.entries(RM_COMPLAINT_DATA)) {
      const existing = await TrainCrimeIntelligence.findOne({
        trainNumber: trainNo,
      });

      if (existing) {
        existing.rmComplaintCount = complaints.length;
        existing.rmComplaints = complaints;
        await existing.save();
        updated++;
      } else {
        await TrainCrimeIntelligence.create({
          trainNumber: trainNo,
          riskLevel: "N/A",
          totalIncidents: 0,
          crimeProfile: [],
          primaryDutyAction: "",
          rmComplaintCount: complaints.length,
          rmComplaints: complaints,
        });
        created++;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Seeded successfully",
      stats: {
        totalTrains: Object.keys(RM_COMPLAINT_DATA).length,
        updated,
        created,
      },
    });
  } catch (error) {
    console.error("SEED ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Seed failed", error: String(error) },
      { status: 500 },
    );
  }
}
