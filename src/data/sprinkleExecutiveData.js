/**
 * Official Sprinkle Executive Overview Data (มกราคม - กันยายน / ตุลาคม)
 * Grounded in the Sprinkle Executive Delivery Compensation presentation
 * Simplified to focus exclusively on Fuel Compensation and Delivery Metrics
 */

export const SPRINKLE_MONTHS = [
  { id: '01', name: 'มกราคม', shortName: 'ม.ค.' },
  { id: '02', name: 'กุมภาพันธ์', shortName: 'ก.พ.' },
  { id: '03', name: 'มีนาคม', shortName: 'มี.ค.' },
  { id: '04', name: 'เมษายน', shortName: 'เม.ย.' },
  { id: '05', name: 'พฤษภาคม', shortName: 'พ.ค.' },
  { id: '06', name: 'มิถุนายน', shortName: 'มิ.ย.' },
  { id: '07', name: 'กรกฎาคม', shortName: 'ก.ค.' },
  { id: '08', name: 'สิงหาคม', shortName: 'ส.ค.' },
  { id: '09', name: 'กันยายน', shortName: 'ก.ย.' },
  { id: '10', name: 'ตุลาคม', shortName: 'ต.ค.' }
];

export const SPRINKLE_OFFICIAL_DATA_9_MONTHS = {
  // Top 4 High-Level KPI Badges
  kpi: {
    distanceKm: 4999451,
    members: 1135530,
    deliveredTanks: 12518498,
    fuelCompensationBaht: 3888310
  },

  // 1. ข้อมูลการจัดส่ง
  deliveryData: {
    title: 'ข้อมูลการจัดส่ง',
    icon: 'truck',
    rows: [
      {
        id: 'distance',
        label: 'ระยะทาง (กม.)',
        type: 'int',
        values: [530888, 517322, 574536, 541283, 572233, 571553, 584025, 553385, 554226],
        october: 497239,
        total: 4999451
      },
      {
        id: 'members',
        label: 'จำนวนสมาชิก (ราย)',
        type: 'int',
        values: [125019, 124592, 127487, 125679, 127348, 126211, 125773, 126682, 126739],
        october: 126500,
        total: 1135530
      },
      {
        id: 'deliveredTanks',
        label: 'ยอดส่ง (ถัง)',
        type: 'int',
        values: [1302581, 1306838, 1456665, 1361728, 1448155, 1431083, 1438490, 1386806, 1386152],
        october: 1218198,
        total: 12518498
      },
      {
        id: 'tanksPerCustomer',
        label: 'การรับน้ำ (เฉลี่ยราย/ถัง)',
        type: 'int',
        values: [10, 10, 11, 11, 11, 11, 11, 11, 11],
        october: 10,
        total: 11
      },
      {
        id: 'metersPerTank',
        label: 'ระยะทาง (เฉลี่ย เมตร/ถัง)',
        type: 'int',
        values: [408, 396, 394, 397, 395, 399, 406, 399, 400],
        october: 408,
        total: 399
      }
    ]
  },

  // 2. ข้อมูลค่าชดเชยน้ำมัน
  fuelData: {
    title: 'ข้อมูลค่าชดเชยน้ำมัน',
    icon: 'fuel',
    rows: [
      {
        id: 'fuelCompBaht',
        label: 'ค่าชดเชยน้ำมัน (บาท)',
        type: 'int',
        isHighlight: true,
        values: [5376, 0, 142892, 863879, 729684, 608949, 404370, 481637, 651523],
        october: 738162,
        total: 3888310
      },
      {
        id: 'fuelCompPerTank',
        label: 'ค่าชดเชยน้ำมัน (บาท/ถัง)',
        type: 'decimal',
        isHighlight: true,
        values: [0.00, 0.00, 0.10, 0.63, 0.50, 0.43, 0.28, 0.35, 0.47],
        october: 0.61,
        total: 0.31
      }
    ]
  }
};
