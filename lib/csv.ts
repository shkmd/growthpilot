// RFC-style quoted CSV fields, including escaped quotes and embedded newlines.
export function parseCsv(input:string):string[][]{
 const text=input.replace(/^\uFEFF/,'');const rows:string[][]=[];let row:string[]=[],field='',quoted=false,closed=false;
 for(let i=0;i<text.length;i++){const c=text[i];
  if(quoted){if(c==='"'){if(text[i+1]==='"'){field+='"';i++}else{quoted=false;closed=true}}else field+=c;continue}
  if(c==='"'){if(field||closed)throw Error('Unexpected quote in CSV.');quoted=true;continue}
  if(c===','||c==='\n'||c==='\r'){row.push(field);field='';closed=false;if(c!==','){if(c==='\r'&&text[i+1]==='\n')i++;if(row.some(v=>v.trim()))rows.push(row);row=[]}continue}
  if(closed)throw Error('Unexpected text after a quoted field.');field+=c;
 }
 if(quoted)throw Error('Unclosed quoted CSV field.');row.push(field);if(row.some(v=>v.trim()))rows.push(row);return rows;
}
