import type { User } from '../types/user';
import type { Project } from '../types/project';

export const mockUsers: User[] = [
    {
        id: '1',
        name: 'Alex Rivera',
        email: 'alex@example.com',
        role: 'seo_analyst',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
    },
    {
        id: '2',
        name: 'Jordan Lee',
        email: 'jordan@example.com',
        role: 'content_writer',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan'
    },
    {
        id: '3',
        name: 'Sam Chen',
        email: 'sam@example.com',
        role: 'content_verifier',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam'
    },
];

export const mockProjects: Project[] = [
    {
        id: '1',
        name: 'Velocity Pumps Website',
        website_url: 'https://velocitypumps.com',
        description: 'Industrial pump manufacturer website redesign',
        created_by: '1',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-20T14:30:00Z',
        members: [],
        pages: [
            {
                id: '1-1',
                project_id: '1',
                name: 'Home Page',
                slug: 'home',
                status: 'pending_review',
                created_at: '2024-01-15T10:00:00Z',
                updated_at: '2024-01-20T14:30:00Z',
                seo_data: {
                    id: 'seo-1',
                    page_id: '1-1',
                    primaryKeywords: ['industrial pumps', 'velocity pumps'],
                    secondaryKeywords: ['pump manufacturer', 'high-pressure pumps'],
                    uploaded_by: '1',
                    uploaded_at: '2024-01-18T09:00:00Z',
                    version: 1,
                },
                content_data: {
                    id: 'content-1',
                    page_id: '1-1',
                    google_sheet_url: 'https://docs.google.com/spreadsheets/d/example',
                    parsed_content: {
                        meta_title: 'Velocity Pumps - Industrial Pump Solutions | Leading Manufacturer',
                        meta_description: 'Velocity Pumps is a leading provider of industrial pumps and high-pressure solutions. 30+ years of experience in centrifugal, positive displacement, and custom pump engineering.',
                        h1: ['Welcome to Velocity Pumps - Your Trusted Industrial Pump Partner'],
                        h2: ['Our Industrial Pump Solutions', 'Why Choose Velocity Pumps', 'Industries We Serve', 'Our Commitment to Quality', 'Get in Touch'],
                        h3: ['High-Pressure Pumps', 'Centrifugal Pumps', 'Positive Displacement Pumps', 'Custom Engineering Solutions', 'API Certified Products', 'ISO 9001 Quality Standards'],
                        paragraphs: [
                            'Velocity Pumps has been a trusted leader in industrial pump manufacturing for over 30 years. Our commitment to excellence and innovation has made us the preferred choice for companies worldwide seeking reliable, high-performance pumping solutions.',
                            'We specialize in designing and manufacturing high-pressure pumps for the most demanding industrial applications. From oil and gas to chemical processing, our pumps deliver consistent performance under extreme conditions.',
                            'Our centrifugal pumps are engineered for maximum efficiency and durability. Available in a wide range of sizes and materials, they handle everything from clean water to abrasive slurries with ease.',
                            'For applications requiring precise flow control, our positive displacement pumps offer unmatched accuracy. These pumps maintain consistent flow rates regardless of pressure changes, making them ideal for metering and dosing applications.',
                            'Every Velocity pump is backed by our industry-leading warranty and 24/7 technical support. Our team of experienced engineers is always ready to help you find the perfect solution for your pumping needs.',
                            'We serve a diverse range of industries including oil and gas, chemical processing, water treatment, mining, food and beverage, and pharmaceutical manufacturing. Our pumps are designed to meet the specific requirements of each sector.',
                            'Quality is at the heart of everything we do. All our products are manufactured in ISO 9001 certified facilities and undergo rigorous testing before shipment. We are also API certified for oil and gas applications.',
                            'Contact our sales team today to discuss your pumping requirements. We offer free consultations and can provide custom solutions tailored to your specific needs. Let us help you improve your operations with reliable Velocity pumps.',
                        ],
                        alt_texts: [
                            'Industrial centrifugal pump installed in manufacturing facility',
                            'High-pressure pump system for oil and gas application',
                            'Engineer inspecting pump components during quality control',
                            'Complete pump assembly line at Velocity Pumps factory',
                            'Chemical processing plant with Velocity pumps installed',
                        ],
                    },
                    uploaded_by: '2',
                    uploaded_at: '2024-01-19T11:00:00Z',
                    version: 1,
                },
                analysis: {
                    id: 'analysis-1',
                    page_id: '1-1',
                    overall_score: 85,
                    seo_score: 82,
                    readability_score: 88,
                    keyword_density_score: 79,
                    grammar_score: 91,
                    content_intent_score: 84,
                    technical_health_score: 87,
                    strategic_analysis_score: 78,
                    brand_intent_score: 80,
                    keyword_analysis: [
                        {
                            keyword: 'industrial pumps',
                            type: 'primary',
                            frequency: 12,
                            density: '2.3%',
                            in_title: true,
                            in_h1: false,
                            in_first_paragraph: true,
                        },
                        {
                            keyword: 'velocity pumps',
                            type: 'primary',
                            frequency: 8,
                            density: '1.5%',
                            in_title: true,
                            in_h1: true,
                            in_first_paragraph: true,
                        },
                    ],
                    suggestions: [
                        {
                            type: 'warning',
                            category: 'SEO',
                            message: 'Consider adding "industrial pumps" to your H1 heading',
                        },
                        {
                            type: 'info',
                            category: 'Readability',
                            message: 'Good use of headings and structure',
                        },
                    ],
                    highlighted_content: `
                        <h1>Welcome to <mark>Velocity Pumps</mark> - Your Trusted Industrial Pump Partner</h1>
                        <h2>Our <mark>Industrial Pump</mark> Solutions</h2>
                        <p><mark>Velocity Pumps</mark> has been a trusted leader in <mark>industrial pump</mark> manufacturing for over 30 years. Our commitment to excellence and innovation has made us the preferred choice for companies worldwide seeking reliable, <mark>high-pressure pumps</mark> and pumping solutions.</p>
                        <h3><mark>High-Pressure Pumps</mark></h3>
                        <p>We specialize in designing and manufacturing <mark>high-pressure pumps</mark> for the most demanding industrial applications. From oil and gas to chemical processing, our pumps deliver consistent performance under extreme conditions.</p>
                        <h3>Centrifugal Pumps</h3>
                        <p>Our centrifugal pumps are engineered for maximum efficiency and durability. Available in a wide range of sizes and materials, they handle everything from clean water to abrasive slurries with ease.</p>
                        <h2>Why Choose <mark>Velocity Pumps</mark></h2>
                        <p>Every <mark>Velocity</mark> pump is backed by our industry-leading warranty and 24/7 technical support. Our team of experienced engineers is always ready to help you find the perfect <mark>pump manufacturer</mark> solution for your needs.</p>
                    `,
                    processed_at: '2024-01-20T12:00:00Z',
                },
            },
            {
                id: '1-2',
                project_id: '1',
                name: 'About Us',
                slug: 'about',
                status: 'awaiting_content',
                created_at: '2024-01-15T10:05:00Z',
                updated_at: '2024-01-18T09:00:00Z',
                seo_data: {
                    id: 'seo-2',
                    page_id: '1-2',
                    primaryKeywords: ['about velocity', 'pump company'],
                    secondaryKeywords: ['manufacturing history'],
                    uploaded_by: '1',
                    uploaded_at: '2024-01-18T09:00:00Z',
                    version: 1,
                },
            },
            {
                id: '1-3',
                project_id: '1',
                name: 'Products',
                slug: 'products',
                status: 'approved',
                created_at: '2024-01-15T10:10:00Z',
                updated_at: '2024-01-19T16:00:00Z',
                seo_data: {
                    id: 'seo-3',
                    page_id: '1-3',
                    primaryKeywords: ['pump products', 'industrial equipment'],
                    secondaryKeywords: ['high-pressure systems'],
                    uploaded_by: '1',
                    uploaded_at: '2024-01-17T10:00:00Z',
                    version: 1,
                },
                content_data: {
                    id: 'content-3',
                    page_id: '1-3',
                    parsed_content: {
                        meta_title: 'Industrial Pump Products | Velocity Pumps Catalog',
                        meta_description: 'Explore our complete range of industrial pumps including centrifugal, positive displacement, and high-pressure systems. API certified, ISO 9001 quality.',
                        h1: ['Industrial Pump Products - Complete Catalog'],
                        h2: ['Centrifugal Pumps', 'Positive Displacement Pumps', 'High-Pressure Systems', 'Specialty Pumps', 'Pump Accessories'],
                        h3: ['Single Stage Centrifugal', 'Multi-Stage Centrifugal', 'Gear Pumps', 'Diaphragm Pumps', 'Piston Pumps', 'Plunger Pumps'],
                        paragraphs: [
                            'Browse our complete range of industrial pumps designed for maximum performance and reliability. Every product in our catalog is engineered to meet the highest industry standards.',
                            'Our centrifugal pump line offers solutions for applications ranging from simple water transfer to complex chemical processing. Available in cast iron, stainless steel, and specialty alloys.',
                            'Positive displacement pumps provide precise flow control for metering, dosing, and transfer applications. Choose from gear, diaphragm, and plunger configurations.',
                            'For applications requiring extreme pressures, our high-pressure systems deliver up to 15,000 PSI with reliable, continuous operation.',
                            'All products come with comprehensive documentation, installation support, and our standard 2-year warranty. Extended warranty options available.',
                        ],
                        alt_texts: [
                            'Centrifugal pump cutaway showing impeller design',
                            'Positive displacement gear pump assembly',
                            'High-pressure plunger pump industrial installation',
                            'Pump accessories and replacement parts display',
                        ],
                    },
                    uploaded_by: '2',
                    uploaded_at: '2024-01-18T14:00:00Z',
                    version: 1,
                },
                analysis: {
                    id: 'analysis-3',
                    page_id: '1-3',
                    overall_score: 92,
                    seo_score: 90,
                    readability_score: 94,
                    keyword_density_score: 88,
                    grammar_score: 95,
                    content_intent_score: 91,
                    technical_health_score: 93,
                    strategic_analysis_score: 89,
                    brand_intent_score: 92,
                    keyword_analysis: [],
                    suggestions: [],
                    highlighted_content: '<h1>Product Catalog</h1>',
                    processed_at: '2024-01-19T15:00:00Z',
                },
            },
            {
                id: '1-4',
                project_id: '1',
                name: 'Contact',
                slug: 'contact',
                status: 'draft',
                created_at: '2024-01-15T10:15:00Z',
                updated_at: '2024-01-15T10:15:00Z',
            },
        ],
    },
];
