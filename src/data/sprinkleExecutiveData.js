/**
 * Official Sprinkle Executive Overview Data (มกราคม - กันยายน / ตุลาคม)
 * Grounded in the Sprinkle Executive Delivery Compensation presentation
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
    deliveryWagesBaht: 159261717
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

  // 2. ค่าจ้างและค่าใช้จ่าย
  expensesData: {
    title: 'ค่าจ้างและค่าใช้จ่าย',
    icon: 'cash',
    rows: [
      {
        id: 'wagesBaht',
        label: 'ค่าจ้างบริการจัดส่ง (บาท)',
        type: 'int',
        values: [16582952, 16620998, 18525732, 17314501, 18420540, 18204703, 18306447, 17640637, 17645207],
        october: 15495478,
        total: 159261717
      },
      {
        id: 'wagesPerTank',
        label: 'ค่าจ้างบริการจัดส่ง (บาท/ถัง)',
        type: 'decimal',
        values: [12.73, 12.72, 12.72, 12.72, 12.72, 12.72, 12.73, 12.72, 12.73],
        october: 12.72,
        total: 12.72
      },
      {
        id: 'fuelCompBaht',
        label: 'ค่าชดเชยน้ำมัน (บาท)',
        type: 'int',
        values: [5376, 0, 142892, 863879, 729684, 608949, 404370, 481637, 651523],
        october: 738162,
        total: 3888310
      },
      {
        id: 'highBuildingBaht',
        label: 'ค่าขนส่งอาคารสูง (บาท)',
        type: 'int',
        values: [393763, 417885, 457938, 422455, 451660, 445865, 482697, 458640, 453594],
        october: 410250,
        total: 3984496
      },
      {
        id: 'tollParkingBaht',
        label: 'ค่าทางด่วน, ค่าที่จอดรถ และค่าเข้าลานง่าม (บาท)',
        type: 'int',
        values: [14887, 13840, 13695, 14685, 15130, 15755, 15165, 14825, 14540],
        october: 14200,
        total: 132522
      },
      {
        id: 'fuelCompPerTank',
        label: 'ค่าชดเชยน้ำมัน (บาท/ถัง)',
        type: 'decimal',
        values: [0.00, 0.00, 0.10, 0.63, 0.50, 0.43, 0.28, 0.35, 0.47],
        october: 0.61,
        total: 0.31
      },
      {
        id: 'highBuildingPerTank',
        label: 'ค่าขนส่งอาคารสูง (บาท/ถัง)',
        type: 'decimal',
        values: [0.30, 0.32, 0.31, 0.31, 0.31, 0.31, 0.34, 0.33, 0.33],
        october: 0.34,
        total: 0.32
      },
      {
        id: 'tollParkingPerTank',
        label: 'ค่าทางด่วน, ค่าที่จอดรถ และค่าเข้าลานง่าม (บาท/ถัง)',
        type: 'decimal',
        values: [0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01],
        october: 0.01,
        total: 0.01
      }
    ],
    // Subtotal 1 (ค่าจ้าง รวม ชดเชยน้ำมัน + อาคารสูง + ทางด่วน)
    subtotalBaht: {
      label: 'ค่าจ้างบริการจัดส่ง รวม ค่าชดเชยน้ำมัน, ค่าขนส่งอาคารสูง และค่าทางด่วนฯ (บาท)',
      type: 'int',
      values: [16996978, 17052723, 19140256, 18615520, 19617015, 19275272, 19208679, 18595739, 18764863],
      october: 16658090,
      total: 167267045
    },
    subtotalPerTank: {
      label: 'ค่าจ้างบริการจัดส่ง รวม ค่าชดเชยน้ำมัน, ค่าขนส่งอาคารสูง และค่าทางด่วนฯ (บาท/ถัง)',
      type: 'decimal',
      values: [13.05, 13.05, 13.14, 13.67, 13.55, 13.47, 13.35, 13.41, 13.54],
      october: 13.67,
      total: 13.36
    }
  },

  // 3. เงินรางวัลมาตรฐานจัดส่ง
  incentivesData: {
    title: 'เงินรางวัลมาตรฐานจัดส่ง',
    icon: 'gift',
    rows: [
      {
        id: 'incentiveBaht',
        label: 'เงินรางวัลมาตรฐานจัดส่ง (บาท)',
        type: 'int',
        values: [877940, 967965, 911860, 597720, 711795, 739300, 749025, 712375, 802025],
        october: 720000,
        total: 7070005
      },
      {
        id: 'incentivePerTank',
        label: 'เงินรางวัลมาตรฐานจัดส่ง (บาท/ถัง)',
        type: 'decimal',
        values: [0.67, 0.74, 0.63, 0.44, 0.49, 0.52, 0.52, 0.51, 0.58],
        october: 0.59,
        total: 0.56
      }
    ],
    // Grand Total (รวมทั้งหมดสุทธิ)
    grandTotalBaht: {
      label: 'ค่าจ้างบริการจัดส่ง รวม ค่าชดเชยน้ำมัน, ค่าขนส่งอาคารสูง และค่าทางด่วนฯ, รางวัลมาตรฐานจัดส่ง (บาท)',
      type: 'int',
      values: [17874918, 18020688, 20052116, 19213240, 20328810, 20014572, 19957704, 19308114, 19566888],
      october: 17378090,
      total: 174337050
    },
    grandTotalPerTank: {
      label: 'ค่าจ้างบริการจัดส่ง รวม ค่าชดเชยน้ำมัน, ค่าขนส่งอาคารสูง และค่าทางด่วนฯ, รางวัลมาตรฐานจัดส่ง (บาท/ถัง)',
      type: 'decimal',
      values: [13.72, 13.79, 13.77, 14.11, 14.04, 13.99, 13.87, 13.92, 14.12],
      october: 14.26,
      total: 13.93
    }
  }
};
