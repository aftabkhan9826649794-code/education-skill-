"""
PDF Receipt Generator with Royal Red & Golden Theme
Generates professional receipts for donations and fee payments
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from reportlab.pdfgen import canvas
from datetime import datetime
import os

# Royal Red & Gold Color Scheme
ROYAL_RED = colors.HexColor('#C41E3A')
DARK_RED = colors.HexColor('#8B0000')
GOLD = colors.HexColor('#FFD700')
DARK_GOLD = colors.HexColor('#B8860B')
LIGHT_GOLD = colors.HexColor('#FFF8DC')
BLACK = colors.HexColor('#000000')
WHITE = colors.HexColor('#FFFFFF')
GRAY = colors.HexColor('#666666')

def generate_donation_receipt(donation_data, output_path):
    """
    Generate PDF receipt for donations
    
    Args:
        donation_data (dict): Donation details
        output_path (str): Path to save PDF
    """
    # Ensure directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Create PDF
    doc = SimpleDocTemplate(output_path, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
    story = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=ROYAL_RED,
        spaceAfter=6,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Normal'],
        fontSize=12,
        textColor=DARK_GOLD,
        spaceAfter=20,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    # Header
    story.append(Paragraph("🏆 WINGS GLOBAL EDU-SKILL HUB", title_style))
    story.append(Paragraph("Royal Red & Golden Cinematic Learning Platform", subtitle_style))
    story.append(Spacer(1, 0.2*inch))
    
    # Receipt Title
    receipt_title_style = ParagraphStyle(
        'ReceiptTitle',
        parent=styles['Heading2'],
        fontSize=18,
        textColor=ROYAL_RED,
        spaceAfter=10,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold',
        backColor=LIGHT_GOLD
    )
    story.append(Paragraph("✨ DONATION RECEIPT ✨", receipt_title_style))
    story.append(Spacer(1, 0.3*inch))
    
    # Receipt details table
    receipt_data = [
        ['Receipt No:', donation_data['receipt_number']],
        ['Date:', donation_data['created_at'].strftime('%d %B %Y, %I:%M %p')],
        ['Donor Type:', donation_data['donor_type']],
        ['Donor Name:', donation_data['donor_name']],
        ['Email:', donation_data['donor_email']],
        ['Phone:', donation_data['donor_phone']],
    ]
    
    if donation_data.get('donor_address'):
        receipt_data.append(['Address:', donation_data['donor_address']])
    
    receipt_table = Table(receipt_data, colWidths=[2*inch, 4*inch])
    receipt_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), LIGHT_GOLD),
        ('TEXTCOLOR', (0, 0), (0, -1), DARK_RED),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY),
        ('ROWBACKGROUNDS', (1, 0), (1, -1), [WHITE, colors.HexColor('#FFF9E6')]),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(receipt_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Payment details
    payment_data = [
        ['Payment Method:', donation_data['payment_method']],
        ['Transaction ID:', donation_data.get('transaction_id', 'N/A')],
        ['Purpose:', donation_data['purpose']],
        ['Amount:', f"₹ {donation_data['amount']:,.2f}"],
    ]
    
    payment_table = Table(payment_data, colWidths=[2*inch, 4*inch])
    payment_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), LIGHT_GOLD),
        ('TEXTCOLOR', (0, 0), (0, -1), DARK_RED),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY),
        ('ROWBACKGROUNDS', (1, 0), (1, -1), [WHITE, colors.HexColor('#FFF9E6')]),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(payment_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Amount in words (simplified)
    amount_words_style = ParagraphStyle(
        'AmountWords',
        parent=styles['Normal'],
        fontSize=12,
        textColor=BLACK,
        spaceAfter=20,
        alignment=TA_LEFT,
        fontName='Helvetica-Bold',
        backColor=colors.HexColor('#FFF9E6'),
        borderColor=DARK_GOLD,
        borderWidth=1,
        borderPadding=10
    )
    story.append(Paragraph(f"<b>Amount in Words:</b> Rupees {donation_data['amount']:.2f} Only", amount_words_style))
    story.append(Spacer(1, 0.4*inch))
    
    # Footer
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=10,
        textColor=GRAY,
        alignment=TA_CENTER,
        fontName='Helvetica-Oblique'
    )
    story.append(Paragraph("Thank you for your generous donation! 🙏", footer_style))
    story.append(Paragraph("Your contribution empowers students worldwide.", footer_style))
    story.append(Spacer(1, 0.2*inch))
    
    thank_you_style = ParagraphStyle(
        'ThankYou',
        parent=styles['Normal'],
        fontSize=14,
        textColor=ROYAL_RED,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    story.append(Paragraph("✨ Digitally Generated by WINGS GLOBAL EDU-SKILL HUB ✨", thank_you_style))
    
    # Build PDF
    doc.build(story)
    return output_path


def generate_fee_receipt(fee_data, output_path):
    """
    Generate PDF receipt for fee payments
    
    Args:
        fee_data (dict): Fee payment details
        output_path (str): Path to save PDF
    """
    # Ensure directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Create PDF
    doc = SimpleDocTemplate(output_path, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
    story = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=ROYAL_RED,
        spaceAfter=6,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Normal'],
        fontSize=12,
        textColor=DARK_GOLD,
        spaceAfter=20,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    # Header
    story.append(Paragraph("🏆 WINGS GLOBAL EDU-SKILL HUB", title_style))
    story.append(Paragraph("Royal Red & Golden Cinematic Learning Platform", subtitle_style))
    story.append(Spacer(1, 0.2*inch))
    
    # Receipt Title
    receipt_title_style = ParagraphStyle(
        'ReceiptTitle',
        parent=styles['Heading2'],
        fontSize=18,
        textColor=ROYAL_RED,
        spaceAfter=10,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold',
        backColor=LIGHT_GOLD
    )
    story.append(Paragraph("💰 FEE PAYMENT RECEIPT 💰", receipt_title_style))
    story.append(Spacer(1, 0.3*inch))
    
    # Student & Parent details
    student_data = [
        ['Receipt No:', fee_data['receipt_number']],
        ['Date:', fee_data['created_at'].strftime('%d %B %Y, %I:%M %p')],
        ['Student Name:', fee_data['student_name']],
        ['Student ID:', fee_data['student_id']],
        ['Class:', fee_data['student_class']],
        ['Parent Name:', fee_data['parent_name']],
        ['Parent Email:', fee_data['parent_email']],
        ['Parent Phone:', fee_data['parent_phone']],
    ]
    
    student_table = Table(student_data, colWidths=[2*inch, 4*inch])
    student_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), LIGHT_GOLD),
        ('TEXTCOLOR', (0, 0), (0, -1), DARK_RED),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY),
        ('ROWBACKGROUNDS', (1, 0), (1, -1), [WHITE, colors.HexColor('#FFF9E6')]),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(student_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Fee details
    fee_details_data = [
        ['Academic Year:', fee_data['academic_year']],
        ['Term:', fee_data['term']],
        ['Fee Type:', fee_data['fee_type']],
        ['Payment Method:', fee_data['payment_method']],
        ['Transaction ID:', fee_data.get('transaction_id', 'N/A')],
        ['Amount Paid:', f"₹ {fee_data['amount']:,.2f}"],
    ]
    
    fee_table = Table(fee_details_data, colWidths=[2*inch, 4*inch])
    fee_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), LIGHT_GOLD),
        ('TEXTCOLOR', (0, 0), (0, -1), DARK_RED),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY),
        ('ROWBACKGROUNDS', (1, 0), (1, -1), [WHITE, colors.HexColor('#FFF9E6')]),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('BACKGROUND', (0, -1), (0, -1), ROYAL_RED),
        ('TEXTCOLOR', (0, -1), (-1, -1), WHITE),
        ('BACKGROUND', (1, -1), (1, -1), LIGHT_GOLD),
        ('TEXTCOLOR', (1, -1), (1, -1), DARK_RED),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, -1), (-1, -1), 13),
    ]))
    story.append(fee_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Amount in words
    amount_words_style = ParagraphStyle(
        'AmountWords',
        parent=styles['Normal'],
        fontSize=12,
        textColor=BLACK,
        spaceAfter=20,
        alignment=TA_LEFT,
        fontName='Helvetica-Bold',
        backColor=colors.HexColor('#FFF9E6'),
        borderColor=DARK_GOLD,
        borderWidth=1,
        borderPadding=10
    )
    story.append(Paragraph(f"<b>Amount in Words:</b> Rupees {fee_data['amount']:.2f} Only", amount_words_style))
    story.append(Spacer(1, 0.4*inch))
    
    # Footer
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=10,
        textColor=GRAY,
        alignment=TA_CENTER,
        fontName='Helvetica-Oblique'
    )
    story.append(Paragraph("Thank you for your payment! 🙏", footer_style))
    story.append(Paragraph("This is a computer-generated receipt and does not require a signature.", footer_style))
    story.append(Spacer(1, 0.2*inch))
    
    thank_you_style = ParagraphStyle(
        'ThankYou',
        parent=styles['Normal'],
        fontSize=14,
        textColor=ROYAL_RED,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    story.append(Paragraph("✨ Digitally Generated by WINGS GLOBAL EDU-SKILL HUB ✨", thank_you_style))
    
    # Build PDF
    doc.build(story)
    return output_path
