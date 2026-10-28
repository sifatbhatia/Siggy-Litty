"""Exercise the real app in Edge, including OS clipboard readback and downloads.
Run: uv run --with playwright python scripts/check-redesign.py [url]
No external images are substituted; unavailable images remain visible as warnings.
"""
import json
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:4188'
OUT = ROOT / 'verification' / ('production' if ':4189' in URL else 'redesign')
OUT.mkdir(parents=True, exist_ok=True)
EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
report = {'url': URL, 'checks': [], 'screenshots': [], 'page_errors': []}

def passed(name):
    report['checks'].append(name)
    print('PASS:', name)

def download(page, button):
    with page.expect_download() as capture:
        page.get_by_role('button', name=button, exact=True).click()
    item = capture.value
    target = OUT / item.suggested_filename
    item.save_as(target)
    return target.read_text(encoding='utf-8')

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=EDGE, headless=True)
    context = browser.new_context(viewport={'width': 1440, 'height': 1050}, permissions=['clipboard-read', 'clipboard-write'])
    page = context.new_page()
    page.on('pageerror', lambda error: report['page_errors'].append(str(error)))
    page.goto(URL, wait_until='networkidle')
    expect(page.locator('iframe[title="Signature preview"]')).to_have_count(1)
    frame = page.frame_locator('iframe')
    expect(frame.locator('body')).to_contain_text('Sifat Bhatia')
    assert page.locator('iframe').get_attribute('sandbox') == 'allow-same-origin'
    assert page.evaluate("document.fonts.check('400 14px \"Siftion UI\"')")
    assert 'Siftion UI' in page.locator('h1').evaluate('(e)=>getComputedStyle(e).fontFamily')
    assert frame.locator('body').evaluate('(e)=>getComputedStyle(e).fontFamily') == 'Arial, Helvetica, sans-serif'
    passed('approved local font loaded; live preview isolated in script-free iframe')

    # Compare actual UI downloads, not only generator calls, with original exports.
    baseline = json.loads((ROOT / 'verification/original-exports.json').read_text(encoding='utf-8'))
    page.get_by_role('tab', name='Style', exact=True).click()
    theme_buttons = page.get_by_role('radio')
    assert theme_buttons.count() == 5
    for i in range(theme_buttons.count()):
        theme_buttons.nth(i).click()
        bundle = json.loads(download(page, 'Download bundle'))
        originals = [row for row in baseline if row['theme'] == bundle['theme']]
        assert len(bundle['variants']) == len(originals) == 6
        for variant in bundle['variants']:
            original = next(row for row in originals if row['variant'] == variant['id'])
            assert variant['html'] == original['html'] and variant['text'] == original['text']
    passed('all 30 UI-exported theme/variant payloads match original bytes, including Bare Transparent')
    page.locator('#theme-linen').click()
    page.locator('#theme-linen').press('ArrowRight')
    expect(page.locator('#theme-cobalt')).to_be_focused()
    expect(page.locator('#theme-cobalt')).to_have_attribute('aria-checked', 'true')
    page.locator('#theme-cobalt').press('Home')
    expect(page.locator('#theme-graphite')).to_be_focused()
    page.locator('#theme-graphite').press('End')
    expect(page.locator('#theme-bare')).to_be_focused()
    page.locator('#theme-linen').click()
    page.get_by_role('tab', name='Profile', exact=True).click()
    page.get_by_role('tab', name='Profile', exact=True).press('ArrowRight')
    expect(page.get_by_role('tab', name='Contact', exact=True)).to_be_focused()
    page.get_by_role('tab', name='Contact', exact=True).press('Home')
    expect(page.get_by_role('tab', name='Profile', exact=True)).to_be_focused()
    passed('editor and five-theme keyboard arrows/Home/End navigate with focus')

    fields = {'fullName': 'Alex & Jordan <script>alert(1)</script>', 'title': 'Design director', 'pronouns': 'they/them', 'company': 'Studio & Co', 'tagline': 'Thoughtful work, together.', 'avatarUrl': 'https://example.com/avatar.png', 'logoUrl': 'https://example.com/logo.png', 'disclaimer': 'Please consider the environment.', 'email': 'alex@example.com', 'phone': '+1 310 555 0100', 'website': 'https://example.com/work', 'calendlyUrl': 'https://example.com/meet', 'location': 'Los Angeles', 'addressLine': '123 Example Street'}
    for key in ['fullName', 'title', 'pronouns', 'company', 'tagline']:
        page.locator('#' + key).fill(fields[key])
    expect(frame.locator('body')).to_contain_text(fields['fullName'])
    assert frame.locator('script').count() == 0
    page.get_by_text('Photo, logo & footer', exact=False).first.click()
    for key in ['avatarUrl', 'logoUrl', 'disclaimer']:
        page.locator('#' + key).fill(fields[key])
    expect(frame.locator('img').first).to_have_attribute('src', fields['avatarUrl'])
    page.get_by_role('tab', name='Contact', exact=True).click()
    for key in ['email', 'phone', 'website', 'calendlyUrl', 'location', 'addressLine']:
        page.locator('#' + key).fill(fields[key])
    expect(frame.get_by_role('link', name='Book time')).to_have_attribute('href', fields['calendlyUrl'])
    expect(frame.get_by_role('link', name=fields['email'])).to_have_attribute('href', 'mailto:' + fields['email'])
    expect(frame.locator('body')).to_contain_text(fields['disclaimer'])
    passed('all 14 profile fields edit, unsafe text is escaped, actual contact/booking links update')

    page.get_by_role('tab', name='Links', exact=True).click()
    social = page.get_by_label('Link 1 label', exact=True)
    social.fill('')
    social.press_sequentially('Selected work', delay=35)
    expect(social).to_be_focused()
    expect(social).to_have_value('Selected work')
    page.get_by_label('Link 1 URL', exact=True).fill('https://example.com/selected')
    page.get_by_role('button', name='＋ Add link', exact=True).click()
    page.get_by_label('Link 4 label', exact=True).fill('Journal')
    page.get_by_label('Link 4 URL', exact=True).fill('https://example.com/journal')
    expect(frame.get_by_role('link', name='Journal')).to_have_attribute('href', 'https://example.com/journal')
    page.get_by_role('button', name='Remove link 2', exact=True).click()
    expect(page.get_by_label('Link 2 label', exact=True)).to_have_value('LinkedIn')
    expect(page.get_by_label('Link 3 label', exact=True)).to_have_value('Journal')
    expect(frame.get_by_role('link', name='Brand', exact=True)).to_have_count(0)
    passed('social multi-character typing retains focus; add, edit, and middle removal preserve identity')

    edited_bundle = json.loads(download(page, 'Download bundle'))
    for key, value in fields.items():
        assert edited_bundle['profile'][key] == value
    assert len(edited_bundle['profile']['socialLinks']) == 3
    assert edited_bundle['profile']['socialLinks'][0]['label'] == 'Selected work'
    for variant in edited_bundle['variants']:
        page.locator('#variant-' + variant['id']).click()
        if variant['html']:
            expect(page.locator('iframe')).to_have_count(1)
            content = download(page, 'Download HTML')
            assert content == variant['html']
            assert 'Siftion UI' not in content and '@font-face' not in content
            assert '&lt;script&gt;' in content and '<script>' not in content
        else:
            expect(page.locator('iframe')).to_have_count(0)
            assert download(page, 'Download text') == variant['text']
    passed('all six real file downloads match bundle; edited profile preserved; no app fonts enter HTML')
    page.locator('#variant-universal-safe').click()
    page.locator('#variant-universal-safe').press('End')
    expect(page.locator('#variant-plain-text')).to_be_focused()
    page.locator('#variant-plain-text').press('Home')
    expect(page.locator('#variant-universal-safe')).to_be_focused()
    page.locator('#variant-universal-safe').press('ArrowRight')
    expect(page.locator('#variant-spark-optimized')).to_be_focused()
    passed('six-format tab keyboard navigation updates output and focus')

    page.locator('#variant-universal-safe').click()
    page.get_by_role('button', name='Copy signature', exact=True).click()
    expect(page.get_by_role('status')).to_contain_text('copied with formatting')
    clipboard = page.evaluate("""async () => { const items = await navigator.clipboard.read(); const r={}; for(const item of items)for(const type of item.types)r[type]=await(await item.getType(type)).text(); return r; }""")
    assert 'text/html' in clipboard and 'text/plain' in clipboard
    assert 'Alex &amp; Jordan &lt;script&gt;' in clipboard['text/html']
    assert fields['fullName'] in clipboard['text/plain'] and '<table' not in clipboard['text/plain']
    page.locator('#variant-plain-text').click()
    expect(page.get_by_role('status')).to_have_text('')
    page.get_by_role('button', name='Copy plain text', exact=True).click()
    expect(page.get_by_role('status')).to_have_text('Plain text copied.')
    actual_plain = page.evaluate('navigator.clipboard.readText()')
    expected_plain = next(v['text'] for v in edited_bundle['variants'] if v['id'] == 'plain-text')
    # Windows clipboard canonicalizes line endings to CRLF; downloaded bytes are checked above.
    assert actual_plain.replace('\r\n', '\n') == expected_plain
    passed('real OS clipboard readback: rich HTML plus readable plain fallback; plain output matches with Windows line endings; stale feedback clears')

    # Explicit denial is injected only for this failure-path test, not used as proof of successful copy.
    denied = context.new_page()
    denied.on('pageerror', lambda error: report['page_errors'].append(str(error)))
    denied.add_init_script("Object.defineProperty(navigator,'clipboard',{value:{write:async()=>{throw new DOMException('Denied','NotAllowedError')},writeText:async()=>{throw new DOMException('Denied','NotAllowedError')}}})")
    denied.goto(URL)
    denied.get_by_role('button', name='Copy signature', exact=True).click()
    expect(denied.get_by_role('status')).to_contain_text('Clipboard blocked')
    manual = denied.locator('.manual-copy textarea')
    expect(manual).to_be_focused()
    assert manual.evaluate('(e)=>e.selectionEnd-e.selectionStart===e.value.length')
    assert 'Sifat Bhatia' in manual.input_value()
    assert download(denied, 'Download HTML').startswith('<div')
    denied.get_by_label('Full name', exact=True).fill('New revision')
    expect(denied.locator('.manual-copy')).to_have_count(0)
    expect(denied.get_by_role('status')).to_have_text('')
    denied.close()
    passed('denied clipboard selects manual fallback without unhandled rejection; download remains usable')

    # Disclosures expose real current output and all preserved reference content.
    source_details = page.locator('.support-details > details').nth(2)
    source_details.locator('summary').click()
    expect(page.get_by_label('Export source', exact=True)).to_have_value(expected_plain)
    page.locator('#variant-universal-safe').click()
    expected_html = next(v['html'] for v in edited_bundle['variants'] if v['id'] == 'universal-safe')
    expect(page.get_by_label('Export source', exact=True)).to_have_value(expected_html)
    source_details.locator('summary').click()
    install_details = page.locator('.support-details > details').nth(0)
    install_details.locator('summary').click()
    expect(install_details.locator('ol')).to_contain_text('real sent message')
    install_details.locator('summary').press('Space')
    expect(install_details).not_to_have_attribute('open', '')
    reference = page.locator('.research')
    reference.locator(':scope > summary').click()
    assert reference.locator(':scope > details').count() == 7
    for client_detail in reference.locator(':scope > details').all():
        client_detail.locator('summary').click()
        assert client_detail.locator('dl > div').count() == 9
        assert client_detail.get_by_role('link').count() >= 2
        client_detail.locator('summary').click()
    reference.locator(':scope > summary').click()
    passed('source disclosure matches current export; native install disclosure and all seven client references remain usable')

    # Restore original profile via reload; only appearance should persist.
    page.reload(wait_until='networkidle')
    expect(page.get_by_label('Full name', exact=True)).to_have_value('Sifat Bhatia')
    assert page.evaluate("Object.keys(localStorage)") == ['signet-appearance']
    passed('profile edits are not silently persisted; only explicit app appearance is stored')
    page.get_by_role('button', name='Switch to dark appearance').click()
    original_html = page.locator('iframe').get_attribute('srcdoc')
    expect(page.locator('html')).to_have_attribute('data-mode', 'night')
    page.reload(wait_until='networkidle')
    expect(page.locator('html')).to_have_attribute('data-mode', 'night')
    assert page.locator('iframe').get_attribute('srcdoc') == original_html
    page.get_by_role('button', name='Switch to light appearance').click()
    assert page.locator('iframe').get_attribute('srcdoc') == original_html
    passed('app appearance persists independently; iframe/export bytes do not recolor')

    for mode in ['day', 'night']:
        if page.locator('html').get_attribute('data-mode') != mode:
            page.get_by_role('button', name='Switch to dark appearance' if mode == 'night' else 'Switch to light appearance').click()
        for width in [1440, 850, 768, 390, 320]:
            page.set_viewport_size({'width': width, 'height': 1050 if width > 850 else 844})
            page.evaluate('window.scrollTo(0,0)')
            if width <= 850:
                page.get_by_role('button', name='Preview & export', exact=True).click()
            page.wait_for_timeout(300)
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (mode, width, 'document overflow')
            iframe = page.locator('iframe')
            assert iframe.bounding_box()['y'] < (700 if width <= 850 else 600)
            metrics = iframe.evaluate('(e)=>({height:e.clientHeight,body:e.contentDocument.body.scrollHeight,width:e.clientWidth,scroll:e.contentDocument.documentElement.scrollWidth})')
            assert metrics['height'] >= metrics['body'], (mode, width, metrics)
            assert metrics['width'] >= metrics['scroll'], (mode, width, metrics)
            shot = f'{mode}-{width}-preview.png'
            page.screenshot(path=str(OUT / shot), full_page=True)
            report['screenshots'].append(shot)
            if width <= 850:
                page.get_by_role('button', name='Edit details', exact=True).click()
                expect(page.get_by_label('Full name', exact=True)).to_be_visible()
                page.get_by_label('Full name', exact=True).fill('Mobile preview test')
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
                shot = f'{mode}-{width}-editor.png'
                page.screenshot(path=str(OUT / shot), full_page=True)
                report['screenshots'].append(shot)
                page.get_by_role('button', name='See your signature', exact=True).click()
                expect(page.frame_locator('iframe').locator('body')).to_contain_text('Mobile preview test')
                page.get_by_role('button', name='Edit details', exact=True).click()
                page.get_by_label('Full name', exact=True).fill('Sifat Bhatia')
                page.get_by_role('button', name='Preview & export', exact=True).click()
        passed(f'{mode}: 1440/850/768/390/320 fit; full-size iframe autoheight, no clipped preview, mobile edit/preview loop')
    page.set_viewport_size({'width': 1440, 'height': 1050})
    expect(page.get_by_label('Full name', exact=True)).to_be_visible()
    expect(page.locator('iframe')).to_be_visible()
    page.emulate_media(reduced_motion='reduce')
    assert page.locator('.primary').evaluate('(e)=>getComputedStyle(e).transitionDuration') == '0s'
    passed('mobile-to-desktop resize restores both panes; reduced motion removes transitions')
    assert not report['page_errors'], report['page_errors']
    passed('zero page errors across success, failure, themes, responsive flows')
    browser.close()
report['passed'] = True
(OUT / 'report.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
print(json.dumps({'passed': True, 'checks': len(report['checks']), 'screenshots': len(report['screenshots']), 'report': str(OUT / 'report.json')}))
