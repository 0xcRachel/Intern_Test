import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.dirname(fileURLToPath(import.meta.url));
const out=path.join(root,'exports'); fs.mkdirSync(out,{recursive:true});
const photo='data:image/png;base64,'+fs.readFileSync(path.join(root,'assets/study-desk-blue.png')).toString('base64');
const c={paper:'#f8f6f0',mist:'#d7eaf3',blue:'#9bc4d8',steel:'#5d8ea6',sand:'#e6d3b3',ink:'#14232c'};
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function canvas(w,h){
 let a=[`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`,`<title>ExamPlatform landing page</title>`];
 const rect=(x,y,w,h,fill=c.paper,r=0,stroke='none')=>a.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`);
 const text=(x,y,s,size=16,weight=400,color=c.ink)=>a.push(`<text x="${x}" y="${y}" font-family="Geist, Segoe UI, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}">${esc(s)}</text>`);
 const line=(x,y,x2,y2,clr=c.blue)=>a.push(`<line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" stroke="${clr}"/>`);
 const btn=(x,y,w,label,fill=c.blue)=>{rect(x,y,w,48,fill,6);text(x+22,y+30,label,16,600);};
 const image=(x,y,w,h)=>a.push(`<image x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" xlink:href="${photo}"/>`);
 const group=(name,fn)=>{a.push(`<g id="${esc(name)}">`);fn();a.push('</g>');};
 const save=name=>{a.push('</svg>');fs.writeFileSync(path.join(out,name),a.join('\n'));};
 rect(0,0,w,h);
 return {rect,text,line,btn,image,group,save};
}
{
 const {rect,text,line,btn,image,group,save}=canvas(1440,2496);
 group('Navigation',()=>{
 text(88,47,'ExamPlatform',23,600);text(728,46,'Tài liệu IELTS',15,500);text(872,46,'Đề luyện tập',15,500);
 rect(1184,18,168,44,c.paper,6,c.steel);text(1222,46,'Đăng nhập',15,600);line(88,80,1352,80);
 });
 group('Hero',()=>{
 text(88,199,'Luyện IELTS,',62,600);text(88,273,'rõ từng bước.',62,600);
 text(88,329,'Học theo bài, luyện đề có thời gian',20);text(88,360,'và xem lại từng câu trả lời.',20);
 btn(88,401,218,'Xem đề luyện tập');text(88,491,'Khám phá tài liệu',16,600);line(88,500,231,500,c.steel);
 rect(756,128,596,448,c.mist,10);image(778,150,552,404);
 });
 group('StudyFlow',()=>{
 line(88,640,1352,640);
 [['Chọn bài học','Tài liệu được sắp xếp theo từng unit.'],['Làm đề luyện tập','Tập trung với thời gian làm bài rõ ràng.'],['Xem lại kết quả','Đối chiếu đáp án và câu trả lời đã chọn.']].forEach((v,i)=>{
 const x=88+i*434;rect(x,683,28,28,i===2?c.sand:c.mist,4);text(x+9,703,String(i+1),14,600);text(x+42,704,v[0],20,600);text(x,748,v[1],15);
 });line(88,798,1352,798);
 });
 group('FeaturedCourse',()=>{
 text(88,897,'Tài liệu cho buổi học tiếp theo',36,600);text(88,935,'Reading và Listening, cùng tài liệu được chia theo từng bài học.',17);
 rect(88,978,1264,342,c.mist,8);
 rect(120,1010,240,278,c.blue,6);text(145,1052,'IELTS',38,600);text(145,1111,'Reading',26,500);text(145,1148,'& Listening',26,500);line(145,1190,335,1190,c.steel);text(145,1230,'Tài liệu theo unit',15,500);
 text(400,1044,'IELTS Comprehensive',29,600);text(400,1084,'Band 8.0+ Prep',29,600);
 text(400,1133,'2 bài học',16,500);text(530,1133,'3 tài liệu',16,500);text(400,1174,'Handbook, bài nghe và bản chép lời.',17);
 btn(400,1220,192,'Xem nội dung',c.paper);
 text(1146,1044,'$49.99',28,600);text(1146,1075,'Giá tham khảo',14);
 });
 group('Practice',()=>{
 text(88,1434,'Biết mình đang làm gì,',38,600);text(88,1482,'ở mỗi bước luyện tập.',38,600);
 text(88,1532,'Chọn đề, làm bài và xem lại kết quả',18);text(88,1562,'trong một luồng rõ ràng.',18);
 rect(88,1610,476,111,c.sand,8);text(112,1647,'IELTS General Reading Test 1',19,600);text(112,1681,'60 phút   /   2 câu hỏi   /   Đạt từ 70%',16);
 text(690,1437,'Trong khi làm bài',22,600);text(690,1478,'Thời gian còn lại luôn dễ thấy.',17);text(690,1511,'Câu đã trả lời được đánh dấu rõ.',17);text(690,1544,'Có xác nhận trước khi nộp bài.',17);
 line(690,1583,1352,1583);
 text(690,1632,'Sau khi nộp bài',22,600);text(690,1673,'Đọc điểm số và trạng thái đạt.',17);text(690,1706,'Xem lại câu sai cùng đáp án đúng.',17);
 });
 group('FAQ',()=>{
 line(88,1790,1352,1790);text(88,1870,'Bạn cần biết',34,600);
 const rows=[['Bắt đầu luyện tập như thế nào?','Đăng nhập, chọn một đề luyện tập và đọc hướng dẫn trước khi bắt đầu.'],['Tôi có thể xem trước tài liệu không?','Giao diện hiển thị giới hạn xem trước của từng tài liệu. Khả năng mở phụ thuộc tài liệu.'],['Điểm bài luyện có phải band IELTS không?','Không. Điểm được tính từ câu trả lời của đề và ngưỡng đạt đã thiết lập.']];
 rows.forEach((v,i)=>{const y=1858+i*101;text(570,y,v[0],19,600);text(570,y+34,v[1],15);if(i<2)line(570,y+65,1352,y+65);});
 });
 group('FinalCTA',()=>{rect(88,2180,1264,164,c.mist,8);text(120,2241,'Bắt đầu từ một bài luyện tập.',30,600);text(120,2281,'Chọn đề phù hợp và dành thời gian để tập trung.',16);btn(1094,2238,218,'Xem đề luyện tập');});
 group('Footer',()=>{text(88,2432,'ExamPlatform',22,600);text(768,2430,'Tài liệu IELTS',15);text(929,2430,'Đề luyện tập',15);text(1196,2430,'Đăng nhập',15);});
 save('landing-desktop.svg');
}
{
 const {rect,text,line,btn,image,group,save}=canvas(390,2790);
 group('Navigation',()=>{text(20,44,'ExamPlatform',21,600);rect(272,17,98,40,c.paper,6,c.steel);text(284,43,'Đăng nhập',14,600);line(20,76,370,76);});
 group('Hero',()=>{
 text(20,139,'Luyện IELTS,',39,600);text(20,188,'rõ từng bước.',39,600);text(20,232,'Học theo bài, luyện đề có thời gian',16);text(20,259,'và xem lại từng câu trả lời.',16);
 btn(20,291,350,'Xem đề luyện tập');text(20,378,'Khám phá tài liệu',16,600);line(20,386,164,386,c.steel);
 rect(20,419,350,264,c.mist,8);image(32,431,326,240);
 });
 group('StudyFlow',()=>{
 [['Chọn bài học','Tài liệu theo từng unit.'],['Làm đề luyện tập','Tập trung trong thời gian quy định.'],['Xem lại kết quả','Đối chiếu từng câu trả lời.']].forEach((v,i)=>{const y=735+i*90;rect(20,y-20,28,28,i===2?c.sand:c.mist,4);text(29,y,String(i+1),14,600);text(64,y,v[0],19,600);text(64,y+29,v[1],15);});
 line(20,999,370,999);
 });
 group('FeaturedCourse',()=>{
 text(20,1064,'Tài liệu cho',30,600);text(20,1104,'buổi học tiếp theo',30,600);
 rect(20,1142,350,407,c.mist,8);text(40,1185,'IELTS Comprehensive',23,600);text(40,1218,'Band 8.0+ Prep',23,600);text(40,1261,'Reading & Listening',17);line(40,1291,350,1291);
 text(40,1332,'2 bài học',16,500);text(192,1332,'3 tài liệu',16,500);text(40,1375,'Handbook, bài nghe và bản chép lời.',15);text(40,1430,'$49.99',27,600);text(155,1429,'Giá tham khảo',14);btn(40,1473,310,'Xem nội dung',c.paper);
 });
 group('Practice',()=>{
 text(20,1629,'Tập trung vào',30,600);text(20,1669,'từng câu trả lời.',30,600);
 text(20,1716,'Trong khi làm bài',20,600);text(20,1751,'Xem thời gian còn lại và câu đã trả lời.',15);text(20,1778,'Xác nhận trước khi nộp bài.',15);
 text(20,1841,'Sau khi nộp bài',20,600);text(20,1876,'Đọc kết quả và xem lại câu sai.',15);
 rect(20,1910,350,115,c.sand,8);text(40,1947,'IELTS General Reading Test 1',18,600);text(40,1984,'60 phút  /  2 câu  /  Đạt từ 70%',15);
 });
 group('FAQ',()=>{
 text(20,2102,'Bạn cần biết',30,600);
 text(20,2153,'Bắt đầu như thế nào?',18,600);text(20,2185,'Đăng nhập và chọn một đề luyện tập.',15);line(20,2214,370,2214);
 text(20,2253,'Điểm này có phải band IELTS?',18,600);text(20,2285,'Không. Đây là điểm của từng đề luyện.',15);
 });
 group('FinalCTA',()=>{rect(20,2352,350,235,c.mist,8);text(40,2402,'Bắt đầu từ một',27,600);text(40,2440,'bài luyện tập.',27,600);btn(40,2499,310,'Xem đề luyện tập');});
 group('Footer',()=>{text(20,2655,'ExamPlatform',21,600);text(20,2702,'Tài liệu IELTS',15);text(207,2702,'Đề luyện tập',15);});
 save('landing-mobile.svg');
}
console.log('Created editable SVG landing desktop 1440x2496 and mobile 390x2790.');
