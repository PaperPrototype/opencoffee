import QRCode from 'qrcode';

/** Inline SVG QR code for a ticket code (espresso on milk, matching the zine theme). */
export const qrSvg = (text: string) =>
	QRCode.toString(text, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: '#241610', light: '#fffdf8' } });
