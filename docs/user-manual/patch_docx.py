from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import xml.etree.ElementTree as ET
import tempfile, shutil

path = Path(__file__).with_name('Ledgify_Complete_User_Manual.docx')
W='http://schemas.openxmlformats.org/wordprocessingml/2006/main'; R='http://schemas.openxmlformats.org/officeDocument/2006/relationships'; PR='http://schemas.openxmlformats.org/package/2006/relationships'; CT='http://schemas.openxmlformats.org/package/2006/content-types'
ET.register_namespace('w',W); ET.register_namespace('r',R)
with ZipFile(path) as z:
    files={name:z.read(name) for name in z.namelist()}

root=ET.fromstring(files['word/document.xml'])
body=root.find(f'{{{W}}}body')
for para in body.findall(f'{{{W}}}p'):
    text=''.join(node.text or '' for node in para.iter(f'{{{W}}}t'))
    if text in {'Document control','Table of contents'} or any(text.startswith(f'{i}. ') for i in range(1,28)):
        ppr=para.find(f'{{{W}}}pPr')
        if ppr is None: ppr=ET.Element(f'{{{W}}}pPr'); para.insert(0,ppr)
        if ppr.find(f'{{{W}}}pageBreakBefore') is None: ppr.insert(0,ET.Element(f'{{{W}}}pageBreakBefore'))

sect=body.find(f'{{{W}}}sectPr')
ref=ET.Element(f'{{{W}}}footerReference'); ref.set(f'{{{W}}}id','rIdFooter1'); sect.insert(0,ref)
files['word/document.xml']=ET.tostring(root,encoding='utf-8',xml_declaration=True)

rels=ET.fromstring(files['word/_rels/document.xml.rels'])
rel=ET.Element(f'{{{PR}}}Relationship',{'Id':'rIdFooter1','Type':'http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer','Target':'footer1.xml'})
rels.append(rel); files['word/_rels/document.xml.rels']=ET.tostring(rels,encoding='utf-8',xml_declaration=True)

types=ET.fromstring(files['[Content_Types].xml'])
types.append(ET.Element(f'{{{CT}}}Override',{'PartName':'/word/footer1.xml','ContentType':'application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml'}))
files['[Content_Types].xml']=ET.tostring(types,encoding='utf-8',xml_declaration=True)

files['word/footer1.xml']=f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr xmlns:w="{W}"><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/><w:color w:val="64748B"/></w:rPr><w:t>Ledgify Complete User Manual  •  </w:t></w:r><w:fldSimple w:instr="PAGE"><w:r><w:rPr><w:sz w:val="18"/><w:color w:val="64748B"/></w:rPr><w:t>1</w:t></w:r></w:fldSimple><w:r><w:rPr><w:sz w:val="18"/><w:color w:val="64748B"/></w:rPr><w:t> of </w:t></w:r><w:fldSimple w:instr="NUMPAGES"><w:r><w:rPr><w:sz w:val="18"/><w:color w:val="64748B"/></w:rPr><w:t>1</w:t></w:r></w:fldSimple></w:p></w:ftr>'''.encode()

temp=path.with_suffix('.tmp.docx')
with ZipFile(temp,'w',ZIP_DEFLATED) as z:
    for name,data in files.items(): z.writestr(name,data)
temp.replace(path)
print('Added chapter page breaks and dynamic page-number footer to DOCX.')
