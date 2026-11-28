// Pixel coordinates in community-search.webp (1437 × 1094).
// Each crop shows one person. The hit area stays on that person's visible body.
const people = [
  // Larger characters
  ['durian-seller', 'Penjual durian bertopi merah', 'easy', [27,655,104,123], [44,669,59,73]],
  ['durian-customer', 'Pelanggan bertudung merah jambu', 'easy', [164,694,91,157], [187,705,51,78]],
  ['worker', 'Pekerja dengan topi keselamatan biru', 'easy', [462,565,81,170], [477,582,55,109]],
  ['cyclist', 'Penunggang basikal berbaju ungu', 'easy', [595,591,87,135], [610,609,50,68]],
  ['skater', 'Pemain papan selaju berbaju kuning dan biru', 'easy', [497,693,130,174], [535,710,74,109]],
  ['mustard-hijab', 'Wanita bertudung kuning dengan beg merah', 'easy', [678,725,108,165], [712,742,51,106]],
  ['schoolboy', 'Murid dengan beg hijau', 'easy', [808,762,108,174], [834,773,51,121]],
  ['wheelchair-user', 'Lelaki berkerusi roda dengan selendang merah', 'easy', [985,719,120,136], [1004,731,56,79]],
  ['dock-fisher', 'Nelayan berbandana ungu', 'easy', [1176,706,98,148], [1190,720,55,87]],
  ['scout', 'Pengakap beret hijau', 'easy', [1035,868,156,155], [1080,880,91,92]],
  ['gardener', 'Pekebun dengan tali suspen merah', 'easy', [543,891,136,147], [572,902,87,99]],
  // Mid-sized characters
  ['graduate', 'Graduan berselendang hijau', 'medium', [826,570,72,144], [843,583,40,94]],
  ['turquoise', 'Wanita berkaca mata berbaju biru kehijauan', 'medium', [887,659,91,169], [905,678,61,91]],
  ['sari-woman', 'Wanita bersari ungu', 'medium', [266,617,64,155], [278,630,38,94]],
  ['batik-man', 'Lelaki berbaju batik merah', 'medium', [316,596,77,165], [330,609,55,106]],
  ['bench-man', 'Lelaki berkaca mata di bangku', 'medium', [317,748,82,111], [334,760,49,79]],
  ['bench-woman', 'Wanita di bangku bertudung ungu muda', 'medium', [389,753,73,116], [405,762,47,84]],
  ['elder-woman', 'Warga emas berpakaian merah jambu', 'medium', [718,600,72,114], [731,610,40,70]],
  ['elder-man', 'Warga emas bersongkok dengan tongkat', 'medium', [768,601,55,116], [780,610,35,74]],
  ['father', 'Lelaki berbaju biru bersama keluarga', 'medium', [133,830,102,144], [159,843,59,107]],
  ['mother', 'Wanita bertudung merah jambu dan berbaju bunga', 'medium', [336,853,103,177], [353,871,68,120]],
  ['flag-boy', 'Budak berbaju belang dengan bendera Malaysia', 'medium', [228,879,70,132], [241,889,42,88]],
  ['pinwheel-girl', 'Budak berbaju merah jambu dengan kincir', 'medium', [299,900,66,139], [312,911,36,92]],
  ['pink-runner', 'Pelari bertudung merah jambu', 'medium', [1063,599,58,139], [1079,612,34,92]],
  ['blue-runner', 'Pelari berbaju biru', 'medium', [1002,576,52,128], [1018,584,28,83]],
  ['yellow-runner', 'Pelari muda berbaju kuning', 'medium', [958,614,53,106], [972,626,25,66]],
  // Smaller people among the crowd
  ['boat-fisher', 'Nelayan bertopi anyaman di dalam sampan', 'hard', [1322,668,63,67], [1339,680,28,41]],
  ['pier-angler', 'Pemancing bertopi jerami di jeti', 'hard', [1295,567,53,86], [1307,576,24,58]],
  ['pier-visitor', 'Pengunjung jeti dengan beg galas gelap', 'hard', [1232,576,44,75], [1247,585,20,48]],
  ['blue-shirt-vendor', 'Peniaga pasar berbaju biru', 'hard', [24,564,79,89], [38,575,36,54]],
  ['market-shopper', 'Pengunjung pasar berbaju ungu muda', 'hard', [104,591,55,100], [115,605,29,68]],
  ['market-helper', 'Penjaja berbaju merah bercorak', 'hard', [11,562,29,75], [17,570,18,47]],
  ['striped-market-man', 'Pengunjung pasar berbaju belang cerah', 'hard', [190,584,64,76], [210,597,30,47]],
  ['market-orange-shirt', 'Lelaki pasar berbaju jingga', 'hard', [289,550,33,68], [296,559,20,43]],
  ['market-yellow-shirt', 'Lelaki pasar berbaju kuning', 'hard', [350,548,33,76], [356,557,22,54]],
  ['floral-shopper', 'Pengunjung berbaju corak merah', 'hard', [406,570,34,97], [412,579,22,63]],
  ['path-backpacker', 'Pejalan kaki dengan beg galas kelabu', 'hard', [660,554,42,105], [671,564,22,67]],
  ['path-orange-hijab', 'Pejalan kaki bertudung jingga muda', 'hard', [692,564,28,93], [699,571,15,60]],
  ['path-mauve', 'Pejalan kaki berbaju ungu kelabu', 'hard', [962,565,27,59], [968,571,14,42]],
];

const TARGETS = people.map(([id, name, level, crop, hit]) => ({
  id, name, level, crop, hit, group: id,
}));
