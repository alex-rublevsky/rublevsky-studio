import { Project } from '@/types/web-project';

const R2_URL = process.env.NEXT_PUBLIC_R2_URL;

if (!R2_URL) {
  throw new Error('NEXT_PUBLIC_R2_URL environment variable is not set');
}

export const webProjects: Project[] = [
  {
    title: 'Africa Power Supply',
    description: 'Website design and development for Africa Power Supply, a fresh Canadian startup planning to revolutionize the African clean energy industry.',
    tools: [
      {
        name: 'Webflow',
        icon: `${R2_URL}/webflow.svg`
      }
    ],
    websiteUrl: 'https://aps-cb63ae.webflow.io/',
    layout: 'full',
    devices: [
      {
        type: 'phone',
        content: {
          type: 'video',
          url: `${R2_URL}/aps_iphone.mp4`
        }
      },
      {
        type: 'tablet',
        content: {
          type: 'video',
          url: `${R2_URL}/aps_tablet.mp4`
        }
      }
    ]
  },
  {
    title: 'BeautyFloor',
    description: 'Website design and development for BeautyFloor, a premium flooring company specializing in high-quality laminate and hardwood floors.',
    tools: [
      {
        name: 'Figma',
        icon: `${R2_URL}/figma.svg`
      },
      {
        name: 'Webflow',
        icon: `${R2_URL}/webflow.svg`
      }
    ],
    websiteUrl: 'https://bfloor.ru/',
    layout: 'full',
    devices: [
      {
        type: 'desktop',
        content: {
          type: 'image',
          url: `${R2_URL}/bfloor1.jpg`
        }
      },
      {
        type: 'desktop',
        content: {
          type: 'image',
          url: `${R2_URL}/bfloor2.jpg`
        }
      },
      {
        type: 'phone',
        content: {
          type: 'image',
          url: `${R2_URL}/bfloor3.jpg`
        }
      },
      {
        type: 'tablet',
        content: {
          type: 'video',
          url: `${R2_URL}/bfloor_tablet.mp4`
        }
      }
    ]
  },
  {
    title: '32KARATA',
    description: 'Website design and development for a dentist clinic 32KARATA',
    tools: [
      {
        name: 'Spline',
        icon: `${R2_URL}/spline.png`
      },
      {
        name: 'Webflow',
        icon: `${R2_URL}/webflow.svg`
      }
    ],
    websiteUrl: 'https://rublevsky-studio.webflow.io/32karata/home',
    layout: 'tablet-only',
    devices: [
      {
        type: 'tablet',
        content: {
          type: 'video',
          url: `${R2_URL}/32karata_tablet.mp4`
        }
      }
    ]
  },
  {
    title: 'InkSoul',
    description: 'Website design and development for InkSoul, a Tattoo studio with a grounded, personalized approach, specializing in graphical and ornamental styles',
    tools: [
      {
        name: 'Figma',
        icon: `${R2_URL}/figma.svg`
      },
      {
        name: 'Webflow',
        icon: `${R2_URL}/webflow.svg`
      }
    ],
    websiteUrl: 'https://inksoul.webflow.io/',
    layout: 'full',
    devices: [
      {
        type: 'phone',
        content: {
          type: 'video',
          url: `${R2_URL}/inksoul-iphone.mp4`
        }
      },
      {
        type: 'tablet',
        content: {
          type: 'video',
          url: `${R2_URL}/inksoul-tablet.mp4`
        }
      }
    ]
  },
  {
    title: 'FemTech',
    description: "Website design and development for FemTech, an innovative company focused on women's health technology solutions.",
    tools: [
      {
        name: 'Figma',
        icon: `${R2_URL}/figma.svg`
      },
      {
        name: 'Webflow',
        icon: `${R2_URL}/webflow.svg`
      }
    ],
    websiteUrl: 'https://www.femtechsearch.com/',
    layout: 'full',
    devices: [
      {
        type: 'phone',
        content: {
          type: 'video',
          url: `${R2_URL}/femtech_iphone.mp4`
        }
      },
      {
        type: 'tablet',
        content: {
          type: 'video',
          url: `${R2_URL}/femtech_tablet.mp4`
        }
      }
    ]
  }
]; 