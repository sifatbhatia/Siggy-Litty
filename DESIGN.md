# Design context

Working notes for Signet. Kept in the repo so future changes stay inside the same boundaries.

## Users

- Primary: personal use (Sifat)
- Secondary: freelancers and agencies who need fast, reliable signatures across clients
- Core job: generate a clean, modern signature once and use it across major mail apps without breakage

## Brand personality

- Premium
- Minimal
- Warm and inviting
- Emotion target: confidence + trust without feeling corporate or stiff

## Aesthetic direction

- Modern two-column layout as default
- Avatar/photo on the left, profile and contact information on the right
- Clean spacing, restrained visual noise, editorial hierarchy
- Support both light and dark environments
- Prefer dynamic text color inheritance where client support allows it
- Basic, approachable color selections over complex branding controls

## Design principles

1. Default to compatibility first, polish second.
2. Preserve a clear two-column signature structure by default.
3. Keep visual hierarchy premium and minimal (strong name/title, quiet metadata).
4. Use progressive enhancement: safe fallbacks for strict clients, richer behavior where supported.
5. Keep configuration simple and low-friction for personal, freelancer, and agency workflows.
6. Prioritize readable contrast and practical accessibility basics (AA-minded, basic baseline).

## App chrome

The interface is built on the Siftion UI design system: paper `#efeee9`, ink `#151515`, signal `#3f4dff`, mono uppercase micro-labels, hairline rules, pill controls with a transparent border, underline-only inputs. Full token and control definitions live in the Siftion design system repo; do not invent new button or tab treatments here.