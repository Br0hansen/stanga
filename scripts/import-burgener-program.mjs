#!/usr/bin/env node

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const SOURCE = 'https://burgenerstrength.com/programming/#workouts';
const API = 'https://burgenerstrength.com/wp-json/wp/v2/workout?per_page=100&_fields=id,date,title,content,slug';
const outputPath = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'burgener-hq.js');

function decodeHtml(text) {
  const named = { amp:'&', apos:"'", gt:'>', hellip:'…', laquo:'«', ldquo:'“', lsquo:'‘', lt:'<', mdash:'—', middot:'·', ndash:'–', nbsp:' ', quot:'"', raquo:'»', rdquo:'”', rsquo:'’' };
  return String(text).replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (all, entity) => {
    if (entity[0] !== '#') return named[entity.toLowerCase()] ?? all;
    const hex = entity[1].toLowerCase() === 'x';
    const code = Number.parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10);
    return Number.isFinite(code) ? String.fromCodePoint(code) : all;
  });
}

function textFromHtml(html) {
  return decodeHtml(html)
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/?(?:p|h[1-6]|ol|ul)[^>]*>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n- ')
    .replace(/<\/li>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function slug(text) {
  return text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 54);
}

const KNOWN = new Map([
  ['snatch','snatch'], ['clean & jerk','cj'], ['back squat','squat'], ['front squat','frontsquat'],
  ['push press','pushpress'], ['snatch balance','snbal'], ['snatch pulls','snpull'],
  ['clean pulls','cleanpull'], ['power snatch','powersnatch'], ['clean','squatclean'],
  ['clean shrug','cleanshrug'], ['clean pulls','cleanpull'], ['snatch pull','snpull']
]);

function liftKey(name) {
  return KNOWN.get(name.toLowerCase()) || `bhq_${slug(name)}`;
}

function isBarbell(name) {
  if (/\b(?:db|kb|dumbbell|kettlebell|box jump|chin-up|sit-up|plank|hold|carry|back extension|push-up|dip|ball slam|turkish|get-up)\b/i.test(name)) return false;
  return /snatch|clean|jerk|squat|press|pull|deadlift|rdl|good morning|overhead/i.test(name);
}

function percentBase(name) {
  if (/back squat/i.test(name)) return 'squat';
  if (/snatch|overhead squat|\bohs\b/i.test(name)) return 'snatch';
  if (/clean|jerk|push press|\bpj\b|\bjrk\b|romanian|\brdl\b|deadlift/i.test(name)) return 'cj';
  if (/front squat|1¼ front|1\/4 front/i.test(name)) return 'frontsquat';
  return null;
}

function listItems(html) {
  return [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map(match => textFromHtml(match[1]).replace(/^-\s*/, '').trim()).filter(Boolean);
}

function parseSetLine(line) {
  const clean = line.replace(/×/g, 'x').replace(/\s+/g, ' ').trim();
  const pc = clean.match(/(?:@|^)\s*(\d+(?:\.\d+)?)\s*%/i);
  const rpe = clean.match(/RPE\s*(\d+(?:\.\d+)?)/i);
  const extra = { text: line };
  if (pc) extra.pc = Number(pc[1]);
  if (rpe) extra.rpe = Number(rpe[1]);
  if (/^(?:rest\b|take % off)/i.test(clean)) return [{ ...extra, n:0, t:0, instruction:true }];

  const singles = clean.match(/^(\d+)\s+total singles/i);
  if (singles) return [{ ...extra, n:Number(singles[1]), t:1 }];
  const parenthesized = clean.match(/^\d+(?:\.\d+)?\s*%\s*:\s*\d+\s*total reps\s*\(([\d,\s]+)\)/i);
  if (parenthesized) return parenthesized[1].split(',').map(value => ({ ...extra, n:1, t:Number(value.trim()) }));
  const listed = clean.match(/(?:total reps[^:]*|@\s*\d+(?:\.\d+)?\s*%|^\d+(?:\.\d+)?\s*%)\s*:\s*([\d, +]+)(?:\s*\(|$)/i);
  if (listed) return listed[1].split(',').map(value => {
    const reps = value.trim();
    return { ...extra, n:1, t:reps.split('+').reduce((sum, part) => sum + Number(part), 0), ...(reps.includes('+') ? {c:reps} : {}) };
  });

  const body = clean
    .replace(/^@?\s*\d+(?:\.\d+)?\s*%\s*:\s*/i, '')
    .replace(/^[^:]+:\s*(?=\d+(?:\s*sets?|\s*,))/i, '');

  let match = body.match(/^(\d+)\s*sets?\s*x\s*\(([\d+]+)\)/i);
  if (match) return [{ ...extra, n:Number(match[1]), t:match[2].split('+').reduce((sum, value) => sum + Number(value), 0), c:match[2] }];
  match = body.match(/^(\d+)\s*sets?\s*x\s*(\d+)\s*(reps?|seconds?|secs?|s\b|minutes?|mins?|min\b|meters?|metres?|m\b|ft\b)/i);
  if (match) return [{ ...extra, n:Number(match[1]), t:Number(match[2]), unit:/second|sec|^s$/i.test(match[3]) ? 'sek' : /minute|min/i.test(match[3]) ? 'min' : /meter|metre|^m$|ft/i.test(match[3]) ? match[3].toLowerCase() : null }];
  match = body.match(/^(\d+)\s*sets?\s*(?:x\s*max\s*reps?|to\s*max)/i);
  if (match) return [{ ...extra, n:Number(match[1]), t:1, max:true }];
  match = body.match(/^(\d+)\s*sets?\s*@/i);
  if (match) {
    const total = clean.match(/total\s*(\d+)\s*reps?/i);
    return [{ ...extra, n:Number(match[1]), t:total ? Math.max(1, Math.round(Number(total[1]) / Number(match[1]))) : 1 }];
  }
  match = body.match(/^(\d+)\s*reps?\s*@/i);
  if (match) return [{ ...extra, n:1, t:Number(match[1]) }];
  match = body.match(/^(\d+(?:\s*,\s*\d+)+)/);
  if (match) return match[1].split(',').map(value => ({ ...extra, n:1, t:Number(value.trim()) }));
  match = body.match(/^(\d+)\s*x\s*(\d+)/i);
  if (match) return [{ ...extra, n:Number(match[1]), t:Number(match[2]) }];
  return [{ ...extra, n:1, t:1, unknown:true }];
}

function nameAndNote(text) {
  const match = text.match(/^([^()]+?)\s*(\([\s\S]*\))?$/);
  return { name:(match?.[1] || text).trim(), note:(match?.[2] || '').replace(/^\(|\)$/g, '').trim() };
}

function exercise(nameText, lines, lifts) {
  const { name, note } = nameAndNote(nameText);
  const key = liftKey(name);
  lifts[key] ||= { n:name, bar:isBarbell(name) ? 1 : 0 };
  return { key, name, base:percentBase(name), note, groups:lines.flatMap(parseSetLine) };
}

function parseExercises(html, lifts) {
  const exercises = [];
  const ordered = html.match(/<ol[^>]*>([\s\S]*?)<\/ol>/i);
  if (ordered) {
    const pattern = /<li[^>]*>([\s\S]*?)<ul[^>]*>([\s\S]*?)<\/ul>\s*<\/li>/gi;
    for (const match of ordered[1].matchAll(pattern)) exercises.push(exercise(textFromHtml(match[1]), listItems(match[2]), lifts));
    return exercises;
  }
  const pattern = /<p[^>]*>\s*<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>([\s\S]*?)<\/p>\s*<ul[^>]*>([\s\S]*?)<\/ul>/gi;
  for (const match of html.matchAll(pattern)) exercises.push(exercise(`${textFromHtml(match[1])} ${textFromHtml(match[2])}`.trim(), listItems(match[3]), lifts));
  return exercises;
}

function parseDays(post, lifts) {
  const parts = post.content.rendered.split(/<h2[^>]*>\s*<strong[^>]*>\s*Day\s+(\d+)\s*<\/strong>\s*<\/h2>/i);
  const days = [];
  for (let index = 1; index < parts.length; index += 2) {
    const day = Number(parts[index]);
    const html = parts[index + 1] || '';
    const marker = html.match(/<h3[^>]*>\s*<strong[^>]*>\s*Workout\s*<\/strong>\s*<\/h3>/i);
    if (!marker) throw new Error(`${post.title.rendered}, dag ${day}: fant ikke Workout`);
    const before = html.slice(0, marker.index);
    const after = html.slice(marker.index + marker[0].length);
    const warmup = textFromHtml(before).replace(/^Warm-Up\s*/i, '').trim();
    const exercises = parseExercises(after, lifts);
    if (!exercises.length) throw new Error(`${post.title.rendered}, dag ${day}: fant ingen øvelser`);
    days.push({ day, warmup, exercises });
  }
  if (days.length !== 4) throw new Error(`${post.title.rendered}: fant ${days.length} dager, forventet 4`);
  return days;
}

async function main() {
  const response = await fetch(API, { headers:{ accept:'application/json' } });
  if (!response.ok) throw new Error(`Burgener API svarte ${response.status}`);
  const posts = await response.json();
  if (!Array.isArray(posts) || posts.length !== 35) throw new Error(`Fant ${posts?.length || 0} uker, forventet 35`);

  const lifts = {};
  const weeks = posts.sort((a, b) => a.date.localeCompare(b.date)).map(post => ({
    id:post.id,
    date:post.date.slice(0, 10),
    title:decodeHtml(post.title.rendered).replace(/\s+/g, ' ').trim(),
    days:parseDays(post, lifts)
  }));
  const data = { v:1, source:SOURCE, fetched:new Date().toISOString().slice(0, 10), weeks, lifts };
  await writeFile(outputPath, `// Generert av scripts/import-burgener-program.mjs. Ikke rediger for hånd.\nconst BURGENER_HQ = ${JSON.stringify(data)};\n`);

  const exercises = weeks.reduce((sum, week) => sum + week.days.reduce((n, day) => n + day.exercises.length, 0), 0);
  const unknown = weeks.flatMap(week => week.days.flatMap(day => day.exercises.flatMap(item => item.groups.filter(group => group.unknown).map(group => `${week.title} dag ${day.day}: ${item.name} — ${group.text}`))));
  console.log(`Importerte ${weeks.length} uker, ${weeks.length * 4} økter og ${exercises} øvelsesblokker.`);
  if (unknown.length) console.log(`${unknown.length} uvanlige settlinjer er bevart som tekst og ett redigerbart sett.`);
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
