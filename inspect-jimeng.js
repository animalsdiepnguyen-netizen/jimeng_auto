// Jimeng Page Inspector - Paste this in Console (F12) to debug
// Chạy script này trong Console của trang Jimeng để xem cấu trúc

console.log('🔍 JIMENG PAGE INSPECTOR');
console.log('========================\n');

// Find all textareas
console.log('📝 TEXTAREAS FOUND:');
const textareas = document.querySelectorAll('textarea');
textareas.forEach((ta, i) => {
  const rect = ta.getBoundingClientRect();
  const style = window.getComputedStyle(ta);
  console.log(`${i + 1}. Textarea:`, {
    placeholder: ta.placeholder,
    id: ta.id,
    className: ta.className,
    name: ta.name,
    rows: ta.rows,
    visible: style.display !== 'none' && style.visibility !== 'hidden',
    dimensions: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
    value: ta.value.substring(0, 50)
  });
});

// Find contenteditable elements
console.log('\n✏️ CONTENTEDITABLE ELEMENTS:');
const contentEditables = document.querySelectorAll('[contenteditable="true"]');
contentEditables.forEach((ce, i) => {
  const rect = ce.getBoundingClientRect();
  console.log(`${i + 1}. Contenteditable:`, {
    tag: ce.tagName,
    id: ce.id,
    className: ce.className,
    text: ce.textContent.substring(0, 50),
    dimensions: `${Math.round(rect.width)}x${Math.round(rect.height)}`
  });
});

// Find all buttons
console.log('\n🔘 BUTTONS FOUND (showing first 30):');
const buttons = document.querySelectorAll('button');
buttons.forEach((btn, i) => {
  if (i < 30) {
    const rect = btn.getBoundingClientRect();
    const style = window.getComputedStyle(btn);
    const text = btn.textContent.trim();
    
    console.log(`${i + 1}. Button:`, {
      text: text.substring(0, 40),
      className: btn.className,
      id: btn.id,
      type: btn.type,
      disabled: btn.disabled,
      visible: rect.width > 0 && rect.height > 0 && style.display !== 'none',
      ariaLabel: btn.getAttribute('aria-label'),
      dimensions: `${Math.round(rect.width)}x${Math.round(rect.height)}`
    });
  }
});

// Find inputs
console.log('\n📥 INPUT FIELDS:');
const inputs = document.querySelectorAll('input[type="text"], input:not([type])');
inputs.forEach((input, i) => {
  if (i < 10) {
    const rect = input.getBoundingClientRect();
    console.log(`${i + 1}. Input:`, {
      type: input.type,
      placeholder: input.placeholder,
      id: input.id,
      className: input.className,
      name: input.name,
      visible: rect.width > 0 && rect.height > 0
    });
  }
});

// Check for forms
console.log('\n📋 FORMS:');
const forms = document.querySelectorAll('form');
console.log(`Found ${forms.length} form(s)`);
forms.forEach((form, i) => {
  console.log(`${i + 1}. Form:`, {
    id: form.id,
    className: form.className,
    action: form.action,
    method: form.method
  });
});

// Find the main generation area
console.log('\n🎨 POSSIBLE GENERATION AREAS:');
const possibleAreas = document.querySelectorAll('[class*="generate"], [class*="prompt"], [class*="input"], [id*="generate"], [id*="prompt"]');
possibleAreas.forEach((area, i) => {
  if (i < 10) {
    console.log(`${i + 1}.`, {
      tag: area.tagName,
      id: area.id,
      className: area.className.substring(0, 80)
    });
  }
});

console.log('\n✅ INSPECTION COMPLETE!');
console.log('=========================');
console.log('\nRECOMMENDATIONS:');
console.log('1. Look for visible textareas with large dimensions');
console.log('2. Find buttons with text containing "生成" or "Generate"');
console.log('3. Check if prompt input is contenteditable div instead of textarea');
console.log('\nTo test filling prompt:');
console.log('  document.querySelector("textarea").value = "test prompt"');
console.log('\nTo test clicking button:');
console.log('  document.querySelectorAll("button")[X].click()  // replace X with button index');
