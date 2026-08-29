import { universityImageFor } from './universityImages'

export type UniversityType = 'iit' | 'nit' | 'iim' | 'deemed' | 'central' | 'state' | 'private'

export type University = {
  id: string
  name: string
  shortName: string
  location: string
  state: string
  type: UniversityType
  image: string
}

export const universityTypeLabels: Record<UniversityType, string> = {
  iit: 'IIT',
  nit: 'NIT',
  iim: 'IIM',
  deemed: 'Deemed',
  central: 'Central',
  state: 'State',
  private: 'Private',
}

const universityCatalog: Omit<University, 'image'>[] = [
  // —— Existing national (kept) ——
  { id: 'iit-bombay', name: 'Indian Institute of Technology Bombay', shortName: 'IIT Bombay', location: 'Mumbai', state: 'Maharashtra', type: 'iit' },
  { id: 'iit-delhi', name: 'Indian Institute of Technology Delhi', shortName: 'IIT Delhi', location: 'New Delhi', state: 'Delhi', type: 'iit' },
  { id: 'iit-madras', name: 'Indian Institute of Technology Madras', shortName: 'IIT Madras', location: 'Chennai', state: 'Tamil Nadu', type: 'iit' },
  { id: 'iit-kanpur', name: 'Indian Institute of Technology Kanpur', shortName: 'IIT Kanpur', location: 'Kanpur', state: 'Uttar Pradesh', type: 'iit' },
  { id: 'iit-kharagpur', name: 'Indian Institute of Technology Kharagpur', shortName: 'IIT Kharagpur', location: 'Kharagpur', state: 'West Bengal', type: 'iit' },
  { id: 'iit-roorkee', name: 'Indian Institute of Technology Roorkee', shortName: 'IIT Roorkee', location: 'Roorkee', state: 'Uttarakhand', type: 'iit' },
  { id: 'bits-pilani', name: 'Birla Institute of Technology and Science, Pilani', shortName: 'BITS Pilani', location: 'Pilani', state: 'Rajasthan', type: 'deemed' },
  { id: 'nit-trichy', name: 'National Institute of Technology Tiruchirappalli', shortName: 'NIT Trichy', location: 'Tiruchirappalli', state: 'Tamil Nadu', type: 'nit' },
  { id: 'nit-warangal', name: 'National Institute of Technology Warangal', shortName: 'NIT Warangal', location: 'Warangal', state: 'Telangana', type: 'nit' },
  { id: 'iisc-bangalore', name: 'Indian Institute of Science', shortName: 'IISc Bangalore', location: 'Bengaluru', state: 'Karnataka', type: 'deemed' },
  { id: 'vit-vellore', name: 'Vellore Institute of Technology', shortName: 'VIT Vellore', location: 'Vellore', state: 'Tamil Nadu', type: 'private' },
  { id: 'manipal', name: 'Manipal Academy of Higher Education', shortName: 'Manipal University', location: 'Manipal', state: 'Karnataka', type: 'deemed' },
  { id: 'srm', name: 'SRM Institute of Science and Technology', shortName: 'SRM University', location: 'Chennai', state: 'Tamil Nadu', type: 'private' },
  { id: 'anna-university', name: 'Anna University', shortName: 'Anna University', location: 'Chennai', state: 'Tamil Nadu', type: 'state' },
  { id: 'jadavpur', name: 'Jadavpur University', shortName: 'Jadavpur University', location: 'Kolkata', state: 'West Bengal', type: 'state' },
  { id: 'iim-ahmedabad', name: 'Indian Institute of Management Ahmedabad', shortName: 'IIM Ahmedabad', location: 'Ahmedabad', state: 'Gujarat', type: 'iim' },
  { id: 'iim-bangalore', name: 'Indian Institute of Management Bangalore', shortName: 'IIM Bangalore', location: 'Bengaluru', state: 'Karnataka', type: 'iim' },
  { id: 'amity', name: 'Amity University', shortName: 'Amity University', location: 'Noida', state: 'Uttar Pradesh', type: 'private' },
  { id: 'lpu', name: 'Lovely Professional University', shortName: 'LPU', location: 'Phagwara', state: 'Punjab', type: 'private' },
  { id: 'pune-university', name: 'Savitribai Phule Pune University', shortName: 'SPPU', location: 'Pune', state: 'Maharashtra', type: 'state' },
  { id: 'bhu', name: 'Banaras Hindu University', shortName: 'BHU', location: 'Varanasi', state: 'Uttar Pradesh', type: 'central' },
  { id: 'thapar', name: 'Thapar Institute of Engineering and Technology', shortName: 'Thapar University', location: 'Patiala', state: 'Punjab', type: 'deemed' },

  // —— Delhi: universities & institutes ——
  { id: 'du', name: 'University of Delhi', shortName: 'Delhi University', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'jnu', name: 'Jawaharlal Nehru University', shortName: 'JNU', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'jmi', name: 'Jamia Millia Islamia', shortName: 'JMI', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'dtu', name: 'Delhi Technological University', shortName: 'DTU', location: 'New Delhi', state: 'Delhi', type: 'state' },
  { id: 'nsut', name: 'Netaji Subhas University of Technology', shortName: 'NSUT', location: 'New Delhi', state: 'Delhi', type: 'state' },
  { id: 'iiit-delhi', name: 'Indraprastha Institute of Information Technology Delhi', shortName: 'IIIT Delhi', location: 'New Delhi', state: 'Delhi', type: 'state' },
  { id: 'nit-delhi', name: 'National Institute of Technology Delhi', shortName: 'NIT Delhi', location: 'New Delhi', state: 'Delhi', type: 'nit' },
  { id: 'igdtuw', name: 'Indira Gandhi Delhi Technical University for Women', shortName: 'IGDTUW', location: 'New Delhi', state: 'Delhi', type: 'state' },
  { id: 'ggsipu', name: 'Guru Gobind Singh Indraprastha University', shortName: 'GGSIPU / IPU', location: 'New Delhi', state: 'Delhi', type: 'state' },
  { id: 'jamia-hamdard', name: 'Jamia Hamdard', shortName: 'Jamia Hamdard', location: 'New Delhi', state: 'Delhi', type: 'deemed' },
  { id: 'spa-delhi', name: 'School of Planning and Architecture, Delhi', shortName: 'SPA Delhi', location: 'New Delhi', state: 'Delhi', type: 'deemed' },
  { id: 'aiims-delhi', name: 'All India Institute of Medical Sciences, New Delhi', shortName: 'AIIMS Delhi', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'mamc', name: 'Maulana Azad Medical College', shortName: 'MAMC', location: 'New Delhi', state: 'Delhi', type: 'state' },
  { id: 'lhmc', name: 'Lady Hardinge Medical College', shortName: 'LHMC', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'ucms', name: 'University College of Medical Sciences', shortName: 'UCMS', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'vmmc', name: 'Vardhman Mahavir Medical College', shortName: 'VMMC', location: 'New Delhi', state: 'Delhi', type: 'state' },
  { id: 'fms-delhi', name: 'Faculty of Management Studies, University of Delhi', shortName: 'FMS Delhi', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'nift-delhi', name: 'National Institute of Fashion Technology Delhi', shortName: 'NIFT Delhi', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'ignou', name: 'Indira Gandhi National Open University', shortName: 'IGNOU', location: 'New Delhi', state: 'Delhi', type: 'central' },

  // —— Delhi University colleges ——
  { id: 'hindu-college', name: 'Hindu College', shortName: 'Hindu College', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'hansraj-college', name: 'Hansraj College', shortName: 'Hansraj College', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'kmc', name: 'Kirori Mal College', shortName: 'Kirori Mal College', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'ramjas', name: 'Ramjas College', shortName: 'Ramjas College', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'st-stephens', name: "St. Stephen's College", shortName: "St. Stephen's", location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'miranda-house', name: 'Miranda House', shortName: 'Miranda House', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'srcc', name: 'Shri Ram College of Commerce', shortName: 'SRCC', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'lsr', name: 'Lady Shri Ram College for Women', shortName: 'LSR', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'daulat-ram', name: 'Daulat Ram College', shortName: 'Daulat Ram College', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'ip-college', name: 'Indraprastha College for Women', shortName: 'IP College', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'sgtb-khalsa', name: 'Sri Guru Tegh Bahadur Khalsa College', shortName: 'SGTB Khalsa', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'sscbs', name: 'Shaheed Sukhdev College of Business Studies', shortName: 'SSCBS', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'venky', name: 'Sri Venkateswara College', shortName: 'Venky', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'arsd', name: 'Atma Ram Sanatan Dharma College', shortName: 'ARSD', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'jmc', name: 'Jesus and Mary College', shortName: 'JMC', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'gargi', name: 'Gargi College', shortName: 'Gargi College', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'maitreyi', name: 'Maitreyi College', shortName: 'Maitreyi College', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'kamala-nehru', name: 'Kamala Nehru College', shortName: 'Kamala Nehru College', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'deshbandhu', name: 'Deshbandhu College', shortName: 'Deshbandhu College', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'motilal-nehru', name: 'Motilal Nehru College', shortName: 'Motilal Nehru College', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'dcac', name: 'Delhi College of Arts and Commerce', shortName: 'DCAC', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'cvs', name: 'College of Vocational Studies', shortName: 'CVS', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'ram-lal-anand', name: 'Ram Lal Anand College', shortName: 'RLA College', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'aryabhatta', name: 'Aryabhatta College', shortName: 'Aryabhatta College', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'andc', name: 'Acharya Narendra Dev College', shortName: 'ANDC', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'sri-aurobindo', name: 'Sri Aurobindo College', shortName: 'Sri Aurobindo College', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'sbs-college', name: 'Shaheed Bhagat Singh College', shortName: 'SBS College', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'ihe', name: 'Institute of Home Economics', shortName: 'IHE', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'lady-irwin', name: 'Lady Irwin College', shortName: 'Lady Irwin College', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'shivaji-college', name: 'Shivaji College', shortName: 'Shivaji College', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'satyawati', name: 'Satyawati College', shortName: 'Satyawati College', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'keshav-mv', name: 'Keshav Mahavidyalaya', shortName: 'Keshav Mahavidyalaya', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'ddu-college', name: 'Deen Dayal Upadhyaya College', shortName: 'DDU College', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'maharaja-agrasen-college', name: 'Maharaja Agrasen College', shortName: 'MAC', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'ramanujan', name: 'Ramanujan College', shortName: 'Ramanujan College', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'pgdav', name: 'P.G.D.A.V. College', shortName: 'PGDAV', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'shyam-lal', name: 'Shyam Lal College', shortName: 'Shyam Lal College', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'vivekananda-college', name: 'Vivekananda College', shortName: 'Vivekananda College', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'kalindi', name: 'Kalindi College', shortName: 'Kalindi College', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'lakshmibai', name: 'Lakshmibai College', shortName: 'Lakshmibai College', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'jdmc', name: 'Janki Devi Memorial College', shortName: 'JDMC', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'mata-sundri', name: 'Mata Sundri College for Women', shortName: 'Mata Sundri College', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'bharati-college', name: 'Bharati College', shortName: 'Bharati College', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'bhagini-nivedita', name: 'Bhagini Nivedita College', shortName: 'Bhagini Nivedita', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'bcas', name: 'Bhaskaracharya College of Applied Sciences', shortName: 'BCAS', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'brac', name: 'Dr. Bhim Rao Ambedkar College', shortName: 'BRAC', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'zakir-husain', name: 'Zakir Husain Delhi College', shortName: 'Zakir Husain College', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'sggscc', name: 'Sri Guru Gobind Singh College of Commerce', shortName: 'SGGSCC', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'sgnd-khalsa', name: 'Sri Guru Nanak Dev Khalsa College', shortName: 'SGND Khalsa', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'aditi-mv', name: 'Aditi Mahavidyalaya', shortName: 'Aditi Mahavidyalaya', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'ssn-college', name: 'Swami Shraddhanand College', shortName: 'SSN College', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'rajdhani', name: 'Rajdhani College', shortName: 'Rajdhani College', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'shaheed-rajguru', name: 'Shaheed Rajguru College of Applied Sciences for Women', shortName: 'Shaheed Rajguru', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'dyal-singh', name: 'Dyal Singh College', shortName: 'Dyal Singh College', location: 'New Delhi', state: 'Delhi', type: 'central' },
  { id: 'spm-college', name: 'Shyama Prasad Mukherji College for Women', shortName: 'SPM College', location: 'New Delhi', state: 'Delhi', type: 'central' },

  // —— Delhi IPU affiliated (private / self-financed) ——
  { id: 'mait', name: 'Maharaja Agrasen Institute of Technology', shortName: 'MAIT', location: 'New Delhi', state: 'Delhi', type: 'private' },
  { id: 'msit', name: 'Maharaja Surajmal Institute of Technology', shortName: 'MSIT', location: 'New Delhi', state: 'Delhi', type: 'private' },
  { id: 'bpit', name: 'Bhagwan Parshuram Institute of Technology', shortName: 'BPIT', location: 'New Delhi', state: 'Delhi', type: 'private' },
  { id: 'bvcoe', name: "Bharati Vidyapeeth's College of Engineering", shortName: 'BVCOE', location: 'New Delhi', state: 'Delhi', type: 'private' },
  { id: 'gtbit', name: 'Guru Tegh Bahadur Institute of Technology', shortName: 'GTBIT', location: 'New Delhi', state: 'Delhi', type: 'private' },
  { id: 'vips', name: 'Vivekananda Institute of Professional Studies', shortName: 'VIPS', location: 'New Delhi', state: 'Delhi', type: 'private' },
  { id: 'adgitm', name: 'Dr. Akhilesh Das Gupta Institute of Technology and Management', shortName: 'ADGITM', location: 'New Delhi', state: 'Delhi', type: 'private' },
  { id: 'maims', name: 'Maharaja Agrasen Institute of Management Studies', shortName: 'MAIMS', location: 'New Delhi', state: 'Delhi', type: 'private' },
  { id: 'jims-rohini', name: 'Jagan Institute of Management Studies', shortName: 'JIMS Rohini', location: 'New Delhi', state: 'Delhi', type: 'private' },

  // —— Haryana: public ——
  { id: 'nit-kurukshetra', name: 'National Institute of Technology Kurukshetra', shortName: 'NIT Kurukshetra', location: 'Kurukshetra', state: 'Haryana', type: 'nit' },
  { id: 'iim-rohtak', name: 'Indian Institute of Management Rohtak', shortName: 'IIM Rohtak', location: 'Rohtak', state: 'Haryana', type: 'iim' },
  { id: 'mdi-gurgaon', name: 'Management Development Institute', shortName: 'MDI Gurugram', location: 'Gurugram', state: 'Haryana', type: 'private' },
  { id: 'mdu-rohtak', name: 'Maharshi Dayanand University', shortName: 'MDU Rohtak', location: 'Rohtak', state: 'Haryana', type: 'state' },
  { id: 'ku-kurukshetra', name: 'Kurukshetra University', shortName: 'Kurukshetra University', location: 'Kurukshetra', state: 'Haryana', type: 'state' },
  { id: 'gjust-hisar', name: 'Guru Jambheshwar University of Science and Technology', shortName: 'GJUS&T Hisar', location: 'Hisar', state: 'Haryana', type: 'state' },
  { id: 'cuh', name: 'Central University of Haryana', shortName: 'CUH', location: 'Mahendragarh', state: 'Haryana', type: 'central' },
  { id: 'ymca-faridabad', name: 'JC Bose University of Science and Technology, YMCA', shortName: 'YMCA Faridabad', location: 'Faridabad', state: 'Haryana', type: 'state' },
  { id: 'dcrust', name: 'Deenbandhu Chhotu Ram University of Science and Technology', shortName: 'DCRUST Murthal', location: 'Sonipat', state: 'Haryana', type: 'state' },
  { id: 'pgims-rohtak', name: 'Pt. B.D. Sharma PGIMS Rohtak', shortName: 'PGIMS Rohtak', location: 'Rohtak', state: 'Haryana', type: 'state' },
  { id: 'bpsmv', name: 'Bhagat Phool Singh Mahila Vishwavidyalaya', shortName: 'BPSMV', location: 'Sonipat', state: 'Haryana', type: 'state' },
  { id: 'cdlu-sirsa', name: 'Chaudhary Devi Lal University', shortName: 'CDLU Sirsa', location: 'Sirsa', state: 'Haryana', type: 'state' },
  { id: 'hau-hisar', name: 'Chaudhary Charan Singh Haryana Agricultural University', shortName: 'HAU Hisar', location: 'Hisar', state: 'Haryana', type: 'state' },
  { id: 'luvas', name: 'Lala Lajpat Rai University of Veterinary and Animal Sciences', shortName: 'LUVAS', location: 'Hisar', state: 'Haryana', type: 'state' },
  { id: 'igu-meerpur', name: 'Indira Gandhi University, Meerpur', shortName: 'IGU Meerpur', location: 'Rewari', state: 'Haryana', type: 'state' },
  { id: 'gurugram-university', name: 'Gurugram University', shortName: 'Gurugram University', location: 'Gurugram', state: 'Haryana', type: 'state' },
  { id: 'dbranlu', name: 'Dr. B.R. Ambedkar National Law University', shortName: 'DBRANLU', location: 'Sonipat', state: 'Haryana', type: 'state' },

  // —— Haryana: private universities ——
  { id: 'sgt', name: 'Shree Guru Gobind Singh Tricentenary University', shortName: 'SGT University', location: 'Gurugram', state: 'Haryana', type: 'private' },
  { id: 'gd-goenka', name: 'G.D. Goenka University', shortName: 'GD Goenka', location: 'Gurugram', state: 'Haryana', type: 'private' },
  { id: 'kr-mangalam', name: 'K.R. Mangalam University', shortName: 'K.R. Mangalam', location: 'Gurugram', state: 'Haryana', type: 'private' },
  { id: 'amity-haryana', name: 'Amity University Haryana', shortName: 'Amity Haryana', location: 'Gurugram', state: 'Haryana', type: 'private' },
  { id: 'northcap', name: 'The NorthCap University', shortName: 'NorthCap University', location: 'Gurugram', state: 'Haryana', type: 'private' },
  { id: 'bml-munjal', name: 'BML Munjal University', shortName: 'BML Munjal', location: 'Gurugram', state: 'Haryana', type: 'private' },
  { id: 'apeejay-stya', name: 'Apeejay Stya University', shortName: 'Apeejay Stya', location: 'Gurugram', state: 'Haryana', type: 'private' },
  { id: 'iilm-gurgaon', name: 'IILM University', shortName: 'IILM Gurugram', location: 'Gurugram', state: 'Haryana', type: 'private' },
  { id: 'starex', name: 'Starex University', shortName: 'Starex University', location: 'Gurugram', state: 'Haryana', type: 'private' },
  { id: 'sushant', name: 'Sushant University', shortName: 'Sushant University', location: 'Gurugram', state: 'Haryana', type: 'private' },
  { id: 'jgu', name: 'O.P. Jindal Global University', shortName: 'JGU Sonipat', location: 'Sonipat', state: 'Haryana', type: 'private' },
  { id: 'ashoka', name: 'Ashoka University', shortName: 'Ashoka University', location: 'Sonipat', state: 'Haryana', type: 'private' },
  { id: 'srm-sonipat', name: 'SRM University, Haryana', shortName: 'SRM Sonipat', location: 'Sonipat', state: 'Haryana', type: 'private' },
  { id: 'rishihood', name: 'Rishihood University', shortName: 'Rishihood', location: 'Sonipat', state: 'Haryana', type: 'private' },
  { id: 'wud', name: 'World University of Design', shortName: 'WUD', location: 'Sonipat', state: 'Haryana', type: 'private' },
  { id: 'manav-rachna', name: 'Manav Rachna University', shortName: 'Manav Rachna', location: 'Faridabad', state: 'Haryana', type: 'private' },
  { id: 'mriirs', name: 'Manav Rachna International Institute of Research and Studies', shortName: 'MRIIRS', location: 'Faridabad', state: 'Haryana', type: 'deemed' },
  { id: 'al-falah', name: 'Al-Falah University', shortName: 'Al-Falah', location: 'Faridabad', state: 'Haryana', type: 'private' },
  { id: 'mvn', name: 'MVN University', shortName: 'MVN University', location: 'Palwal', state: 'Haryana', type: 'private' },
  { id: 'pdm', name: 'PDM University', shortName: 'PDM University', location: 'Bahadurgarh', state: 'Haryana', type: 'private' },
  { id: 'jagannath-jhajjar', name: 'Jagan Nath University', shortName: 'Jagan Nath Jhajjar', location: 'Jhajjar', state: 'Haryana', type: 'private' },
  { id: 'geeta-panipat', name: 'Geeta University', shortName: 'Geeta University', location: 'Panipat', state: 'Haryana', type: 'private' },
  { id: 'mm-mullana', name: 'Maharishi Markandeshwar (Deemed to be University)', shortName: 'MM Mullana', location: 'Ambala', state: 'Haryana', type: 'deemed' },
  { id: 'baba-mastnath', name: 'Baba Mastnath University', shortName: 'Baba Mastnath', location: 'Rohtak', state: 'Haryana', type: 'private' },
  { id: 'om-sterling', name: 'Om Sterling Global University', shortName: 'Om Sterling', location: 'Hisar', state: 'Haryana', type: 'private' },
  { id: 'niilm-kaithal', name: 'NIILM University', shortName: 'NIILM Kaithal', location: 'Kaithal', state: 'Haryana', type: 'private' },

  // —— Online & distance (search-friendly) ——
  { id: 'gla-university', name: 'GLA University', shortName: 'GLA University', location: 'Mathura', state: 'Uttar Pradesh', type: 'private' },
  { id: 'gla-university-online', name: 'GLA University Online', shortName: 'GLA Online', location: 'Online', state: 'Uttar Pradesh', type: 'private' },
  { id: 'chandigarh-university', name: 'Chandigarh University', shortName: 'Chandigarh University', location: 'Mohali', state: 'Punjab', type: 'private' },
  { id: 'chandigarh-university-online', name: 'Chandigarh University Online', shortName: 'CU Online', location: 'Online', state: 'Punjab', type: 'private' },
  { id: 'amity-university-online', name: 'Amity University Online', shortName: 'Amity Online', location: 'Online', state: 'Uttar Pradesh', type: 'private' },

  // —— Haryana: Jat / aided colleges ——
  { id: 'jat-college-rohtak', name: "All India Jat Heroes' Memorial College", shortName: 'Jat College Rohtak', location: 'Rohtak', state: 'Haryana', type: 'state' },
  { id: 'crm-jat-hisar', name: 'Chhaju Ram Memorial Jat College', shortName: 'CRM Jat College Hisar', location: 'Hisar', state: 'Haryana', type: 'state' },
]

export const universities: University[] = universityCatalog.map((entry, index) => ({
  ...entry,
  image: universityImageFor(entry.id, index),
}))

export function universityById(id: string): University | undefined {
  return universities.find((u) => u.id === id)
}

export function universitiesByType(type: UniversityType): University[] {
  return universities.filter((u) => u.type === type)
}

export function universitiesByState(state: string): University[] {
  return universities.filter((u) => u.state.toLowerCase() === state.toLowerCase())
}
