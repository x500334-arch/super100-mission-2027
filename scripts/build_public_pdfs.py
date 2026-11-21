#!/usr/bin/env python3
"""Generate public, bilingual chapter PDFs from the site's revision content."""
import os, re, json, html, subprocess
from weasyprint import HTML

raw = subprocess.check_output(["node", "-e", """
const fs=require('fs'),vm=require('vm');
const src=fs.readFileSync('content.js','utf8');
process.stdout.write(vm.runInNewContext(src+'\\nJSON.stringify({material,advancedNotes})'));
"""], text=True)
data=json.loads(raw)
names=[
("01_Average.pdf","Average / औसत"),
("02_Speed_Time_Distance.pdf","Speed, Time and Distance / गति, समय और दूरी"),
("03_Profit_Loss_Discount.pdf","Profit, Loss and Discount / लाभ, हानि और छूट"),
("04_Mensuration.pdf","Mensuration (2D and 3D) / क्षेत्रमिति"),
("05_Ratio_Proportion_Alligation.pdf","Ratio, Proportion and Alligation / अनुपात, समानुपात और मिश्रण"),
("06_Simple_Compound_Interest.pdf","Simple and Compound Interest / साधारण और चक्रवृद्धि ब्याज"),
("07_Time_Work.pdf","Time and Work / समय और कार्य"),
("08_Pipes_Cisterns.pdf","Pipes and Cisterns / नल और टंकी"),
("09_Percentage.pdf","Percentage / प्रतिशत"),
("10_Geometry.pdf","Geometry / ज्यामिति"),
("11_BODMAS.pdf","Simplification (BODMAS) / सरलीकरण"),
("12_Quadratic_Equations.pdf","Quadratic Equations / द्विघात समीकरण"),
("13_Trigonometry.pdf","Trigonometry / त्रिकोणमिति"),
("14_Algebraic_Expressions.pdf","Algebraic Expressions / बीजीय व्यंजक")]
css="""@page{size:A4;margin:20mm 17mm}body{font-family:'Noto Sans Devanagari','Noto Sans',sans-serif;color:#182541;line-height:1.62;font-size:11pt}h1{font-size:21pt;color:#223f92;line-height:1.3}h2{font-size:14pt;color:#355ab2;margin-top:22px}header{border-bottom:2px solid #687fe2;padding-bottom:9px;font-size:10pt;color:#667}p{margin:7px 0;white-space:pre-wrap}li{margin:7px 0}section{break-inside:avoid}footer{margin-top:28px;border-top:1px solid #ccd;padding-top:8px;font-size:9pt;color:#667}.answer{background:#e9eefb;padding:9px;border-radius:6px}"""
os.makedirs('pdf',exist_ok=True)
for i,(filename,title) in enumerate(names):
 m=data['material'][i]; a=data['advancedNotes'][i]
 def p(x):return '<p>'+html.escape(str(x))+'</p>'
 blocks=['<header>SUPER 100 · MISSION 2027 — PUBLIC STUDY NOTES</header>',
 '<h1>Chapter '+str(i+1)+' · '+html.escape(title)+'</h1>',
 '<h2>Core Concepts / मुख्य अवधारणाएँ</h2>',p(m[0]),p(m[1]),
 '<h2>Important Principles / महत्वपूर्ण बातें</h2>',p(m[2]),p(m[3]),
 '<h2>Advanced Revision / उच्च स्तरीय पुनरावृत्ति</h2>',p(a[0]),p(a[1]),
 '<h2>Worked Examples / हल किए हुए उदाहरण</h2>',
 '<ol>'+''.join('<li>'+html.escape(str(v))+'</li>' for v in a[2])+'</ol>',
 '<h2>Practice Question / अभ्यास प्रश्न</h2>',p(m[4]),
 '<ol type="A">'+''.join('<li>'+html.escape(str(v))+'</li>' for v in m[5])+'</ol>',
 '<section class="answer"><b>Answer / उत्तर: '+chr(65+int(m[6]))+' — '+html.escape(str(m[5][int(m[6])]))+'</b>'+p(m[7])+'</section>',
 '<footer>2026 Level-1 syllabus revision notes · Original practice material, not verified past-year questions.</footer>']
 page='<html lang="en"><meta charset="utf-8"><style>'+css+'</style><body>'+''.join(blocks)+'</body></html>'
 HTML(string=page,base_url=os.getcwd()).write_pdf(os.path.join('pdf',filename))
 print(filename)
