/**
 * ====================================================================
 *   HelpDesk Pro - Backend REST API no Google Apps Script (Google Sheets)
 * ====================================================================
 * 
 * INSTRUÇÕES DE INSTALAÇÃO:
 * 1. Crie uma planilha no Google Sheets com o nome: "HelpDesk_Pro_DB"
 * 2. Crie 4 abas na planilha com os nomes exatos:
 *    - "Chamados"
 *    - "Usuarios"
 *    - "Setores"
 *    - "TiposProblemas"
 * 
 * 3. Na aba "Chamados", defina o cabeçalho na Linha 1 com as colunas:
 *    A: id | B: title | C: description | D: sectorId | E: sectorName |
 *    F: problemTypeId | G: problemTypeName | H: priority | I: status |
 *    J: userId | K: userName | L: assignedTo | M: assignedName |
 *    N: assetTag | O: createdAt | P: updatedAt | Q: solutionSummary |
 *    R: solutionTimeSpent | S: solutionPreventive | T: timelineJson
 * 
 * 4. Acesse: Extensões > Apps Script.
 * 5. Cole este código no editor (substituindo tudo).
 * 6. Clique em "Implantar" > "Nova implantação".
 * 7. Tipo: "Aplicativo da Web".
 * 8. "Executar como": Eu.
 * 9. "Quem tem acesso": Qualquer pessoa (Anyone).
 * 10. Copie a URL gerada e configure no seu frontend!
 */

const SS = SpreadsheetApp.getActiveSpreadsheet();

// Converte qualquer aba em lista de Objetos JSON
function sheetToObjects(sheetName) {
  const sheet = SS.getSheetByName(sheetName);
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  
  const headers = rows[0];
  const data = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      let val = row[j];
      if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
        try { val = JSON.parse(val); } catch (e) {}
      }
      obj[headers[j]] = val;
    }
    data.push(obj);
  }
  return data;
}

// Endpoint GET: Listagem de dados
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'all';
  let responseData = {};
  
  try {
    if (action === 'all' || action === 'init') {
      responseData = {
        success: true,
        tickets: sheetToObjects('Chamados'),
        users: sheetToObjects('Usuarios'),
        sectors: sheetToObjects('Setores'),
        problemTypes: sheetToObjects('TiposProblemas')
      };
    } else if (action === 'tickets') {
      responseData = { success: true, tickets: sheetToObjects('Chamados') };
    }
  } catch (err) {
    responseData = { success: false, error: err.toString() };
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(responseData))
    .setMimeType(ContentService.MimeType.JSON);
}

// Endpoint POST: Criação e atualização de dados
function doPost(e) {
  let output = { success: false };
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    
    if (action === 'createTicket') {
      output = handleCreateTicket(payload.data);
    } else if (action === 'updateTicket') {
      output = handleUpdateTicket(payload.data);
    } else if (action === 'registerSolution') {
      output = handleRegisterSolution(payload.data);
    } else if (action === 'createSector') {
      output = appendRow('Setores', payload.data);
    } else if (action === 'createProblemType') {
      output = appendRow('TiposProblemas', payload.data);
    } else if (action === 'createUser') {
      output = appendRow('Usuarios', payload.data);
    }
  } catch (err) {
    output = { success: false, error: err.toString() };
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

// Higienização para prevenir injeção de fórmulas no Google Sheets (=, +, -, @)
function sanitizeCell(val) {
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.startsWith('=') || trimmed.startsWith('+') || trimmed.startsWith('-') || trimmed.startsWith('@')) {
      return "'" + trimmed; // Prefixa apóstrofo para tratar como texto puro no Sheets
    }
    return trimmed;
  }
  return val;
}

// Inserção de novo chamado
function handleCreateTicket(ticket) {
  const sheet = SS.getSheetByName('Chamados');
  const id = 'TICK-' + (Math.floor(1000 + Math.random() * 9000));
  const createdAt = new Date().toISOString();
  
  sheet.appendRow([
    id,
    sanitizeCell(ticket.title || ''),
    sanitizeCell(ticket.description || ''),
    sanitizeCell(ticket.sectorId || ''),
    sanitizeCell(ticket.sectorName || ''),
    sanitizeCell(ticket.problemTypeId || ''),
    sanitizeCell(ticket.problemTypeName || ''),
    sanitizeCell(ticket.priority || 'media'),
    'aberto',
    sanitizeCell(ticket.userId || ''),
    sanitizeCell(ticket.userName || ''),
    sanitizeCell(ticket.assignedTo || ''),
    sanitizeCell(ticket.assignedName || ''),
    sanitizeCell(ticket.assetTag || ''),
    createdAt,
    createdAt,
    '', // solutionSummary
    '', // solutionTimeSpent
    '', // solutionPreventive
    JSON.stringify([{ date: createdAt, author: sanitizeCell(ticket.userName), text: 'Chamado aberto via portal' }])
  ]);
  
  return { success: true, id: id };
}

// Atualização de status e campos de chamado
function handleUpdateTicket(ticket) {
  const sheet = SS.getSheetByName('Chamados');
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === ticket.id) {
      const rowNum = i + 1;
      if (ticket.status) sheet.getRange(rowNum, 9).setValue(ticket.status);
      if (ticket.priority) sheet.getRange(rowNum, 8).setValue(ticket.priority);
      sheet.getRange(rowNum, 16).setValue(new Date().toISOString());
      return { success: true };
    }
  }
  return { success: false, message: 'Chamado não encontrado' };
}

// Registro de solução técnica e conclusão
function handleRegisterSolution(data) {
  const sheet = SS.getSheetByName('Chamados');
  const values = sheet.getDataRange().getValues();
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === data.ticketId) {
      const rowNum = i + 1;
      sheet.getRange(rowNum, 9).setValue('concluido');
      sheet.getRange(rowNum, 16).setValue(new Date().toISOString());
      sheet.getRange(rowNum, 17).setValue(data.summary);
      sheet.getRange(rowNum, 18).setValue(data.timeSpentHours);
      sheet.getRange(rowNum, 19).setValue(data.preventiveNotes);
      
      let timeline = [];
      try { timeline = JSON.parse(values[i][19] || '[]'); } catch (e) {}
      timeline.push({
        date: new Date().toISOString(),
        author: data.appliedBy,
        text: 'Solução técnica registrada. Chamado concluído.'
      });
      sheet.getRange(rowNum, 20).setValue(JSON.stringify(timeline));
      
      return { success: true };
    }
  }
  return { success: false, message: 'Chamado não encontrado' };
}

// Helper para inserção genérica com sanitização de segurança
function appendRow(sheetName, item) {
  const sheet = SS.getSheetByName(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const newRow = headers.map(header => item[header] !== undefined ? sanitizeCell(item[header]) : '');
  sheet.appendRow(newRow);
  return { success: true, item: item };
}
