export interface UseCase {
  name: string;
  description: string;
  solutions: {
    name: string;
    links: { type: string; url: string }[];
  }[];
  customerEvidence: {
    name: string;
    solutionPlay: string;
    storyUrl?: string;
  }[];
}

export interface FunctionData {
  name: string;
  personas: {
    buyer: string[];
    influencer: string[];
  };
  priorities: string[];
  useCases: UseCase[];
}

export const functionsData: Record<string, FunctionData> = {
  'Financial Services': {
    name: 'Financial Services',
    personas: {
      buyer: ['CRO', 'CISO', 'Chief Compliance Officer', 'Head of Financial Crime', 'CIO', 'CTO', 'COO', 'CMO', 'CDO'],
      influencer: ['Fraud analysts', 'Data scientists', 'Compliance officers', 'CX leaders', 'Contact center managers', 'Relationship managers', 'Product management']
    },
    priorities: [
      'Improved risk assessment and fraud detection',
      'Enhanced customer experience and satisfaction',
      'Increased revenue and operational efficiency',
      'Reduced costs and improved decision making',
      'Faster time to market for products and services',
      'Improved compliance and regulatory adherence'
    ],
    useCases: [
      {
        name: 'Improve fraud analysis and detection',
        description: 'Combat fraud by helping intelligence officers with AI-based tools that provide real-time insights, reduce false positives, and detect fraudulent behavior.',
        solutions: [
          {
            name: 'Azure AI Foundry',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-foundry' }]
          },
          {
            name: 'Azure OpenAI Service',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-services/openai-service' }]
          }
        ],
        customerEvidence: [
          { name: 'Belfius', solutionPlay: 'Innovate with Azure AI Apps and Agents', storyUrl: 'https://www.microsoft.com/en/customers/story/belfius-banking-azure-openai-service' },
          { name: 'Swift', solutionPlay: 'Innovate with Azure AI Apps and Agents', storyUrl: 'https://www.swift.com/' },
          { name: 'Quantexa', solutionPlay: 'Innovate with Azure AI Apps and Agents' }
        ]
      },
      {
        name: 'Transform the contact center',
        description: 'Empower customer service representatives and transform the bank\'s contact center from low-value servicing activities to driving cross-sell and upsell of financial products with the help of AI.',
        solutions: [
          {
            name: 'Dynamics 365 Contact Center',
            links: [{ type: 'Demo', url: 'https://dynamics.microsoft.com/en-us/contact-center/overview/' }]
          },
          {
            name: 'Microsoft Copilot Studio',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-copilot/microsoft-copilot-studio' }]
          }
        ],
        customerEvidence: [
          { name: 'Ally Financial', solutionPlay: 'Service Transformation with AI', storyUrl: 'https://www.microsoft.com/en/customers/story/ally-financial-banking-azure-openai-service' },
          { name: 'Virgin Money', solutionPlay: 'Service Transformation with AI', storyUrl: 'https://www.microsoft.com/en/customers/story/1795836141096013038-virgin-money-dynamics-365-customer-service-banking-and-capital-markets-en-united-kingdom' }
        ]
      },
      {
        name: 'Empower relationship managers',
        description: 'Drive better customer engagement by equipping relationship managers with AI tools that enhance meeting preparation, provide better customer insights, and summarize customer conversations.',
        solutions: [
          {
            name: 'Microsoft 365 Copilot',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-365/copilot' }]
          },
          {
            name: 'Microsoft Copilot Studio',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-copilot/microsoft-copilot-studio' }]
          },
          {
            name: 'Azure AI Foundry',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-foundry' }]
          }
        ],
        customerEvidence: [
          { name: 'UBS', solutionPlay: 'Copilot and Agents at Work', storyUrl: 'https://www.ubs.com/' },
          { name: 'Bank of Queensland', solutionPlay: 'Copilot and Agents at Work', storyUrl: 'https://www.microsoft.com/en/customers/story/bank-of-queensland-banking-microsoft-365-copilot' }
        ]
      },
      {
        name: 'Modernize claims and underwriting processes',
        description: 'Improve policyholder satisfaction and reduce claims resolution time by using AI to automate and accelerate claims processing while enhancing fraud detection and underwriting efficiency.',
        solutions: [
          {
            name: 'Dynamics 365',
            links: [{ type: 'Demo', url: 'https://dynamics.microsoft.com/' }]
          },
          {
            name: 'Azure AI Services',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-services' }]
          }
        ],
        customerEvidence: [
          { name: 'SACE', solutionPlay: 'Innovate with Azure AI Apps and Agents', storyUrl: 'https://www.sace.it/' },
          { name: 'Manulife', solutionPlay: 'Copilot and Agents at Work', storyUrl: 'https://www.manulife.com/' }
        ]
      }
    ]
  },
  'Healthcare': {
    name: 'Healthcare',
    personas: {
      buyer: ['CEO', 'CFO', 'CMIO', 'CIO', 'CMO', 'COO', 'CISO', 'CDO', 'CDAO'],
      influencer: ['Clinician champions', 'Patient Experience Managers', 'Healthcare Marketing Managers', 'IT Managers', 'Clinical Research Team', 'Care Team Managers']
    },
    priorities: [
      'Improve operational efficiency and clinician wellbeing',
      'Enhance patient engagement and care quality',
      'Accelerate clinical research and discovery',
      'Reduce administrative burden and costs',
      'Improve security and compliance',
      'Enable data-driven decision making'
    ],
    useCases: [
      {
        name: 'Transform Clinical Workflow',
        description: 'Improve operational efficiency, clinician wellbeing, and patient engagement with AI-powered clinical documentation and workflow automation.',
        solutions: [
          {
            name: 'Dragon Copilot',
            links: [{ type: 'Demo', url: 'https://www.nuance.com/healthcare/dragon-medical.html' }]
          },
          {
            name: 'Microsoft 365 Copilot',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-365/copilot' }]
          },
          {
            name: 'Microsoft Copilot Studio',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-copilot/microsoft-copilot-studio' }]
          }
        ],
        customerEvidence: [
          { name: 'Northwestern Medicine', solutionPlay: 'Copilot & Agents at Work', storyUrl: 'https://www.nm.org/' },
          { name: 'Valley View Hospital', solutionPlay: 'Copilot & Agents at Work' },
          { name: 'Nemours Children\'s Health', solutionPlay: 'Copilot & Agents at Work' }
        ]
      },
      {
        name: 'Personalize patient engagement',
        description: 'Enhance patient interactions and improve care outcomes with AI-powered personalized experiences and self-service capabilities.',
        solutions: [
          {
            name: 'Microsoft Copilot Studio',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-copilot/microsoft-copilot-studio' }]
          },
          {
            name: 'Azure OpenAI Service',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-services/openai-service' }]
          }
        ],
        customerEvidence: [
          { name: 'Providence', solutionPlay: 'Copilot and Agents at Work', storyUrl: 'https://www.microsoft.com/en/customers/story/providence-health-services-azure-openai-service' }
        ]
      },
      {
        name: 'Accelerate clinical research and patient care',
        description: 'Analyze multimodal data to advance clinical research and improve patient care outcomes with comprehensive insights into diagnostic conditions and treatment plans.',
        solutions: [
          {
            name: 'Azure AI Foundry',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-foundry' }]
          },
          {
            name: 'Azure Machine Learning',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/machine-learning' }]
          },
          {
            name: 'Microsoft Fabric',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-fabric' }]
          }
        ],
        customerEvidence: [
          { name: 'City of Hope', solutionPlay: 'Innovate with Azure AI Apps and Agents', storyUrl: 'https://www.cityofhope.org/' },
          { name: 'Shriners', solutionPlay: 'Innovate with Azure AI Apps and Agents' },
          { name: 'University of South Carolina', solutionPlay: 'Innovate with Azure AI Apps and Agents' }
        ]
      },
      {
        name: 'Unify member and clinical data',
        description: 'Integrate and unify all healthcare data to generate valuable insights that drive better clinical decisions and improve member outcomes.',
        solutions: [
          {
            name: 'Microsoft Fabric',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-fabric' }]
          },
          {
            name: 'Azure AI Services',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-services' }]
          }
        ],
        customerEvidence: [
          { name: 'Trizetto', solutionPlay: 'Unify Your Data Platform' },
          { name: 'Infosys Helix', solutionPlay: 'Unify Your Data Platform' }
        ]
      }
    ]
  },
  'Retail': {
    name: 'Retail',
    personas: {
      buyer: ['CMO', 'Marketing BDM', 'Chief Merchandising Officer', 'CTO', 'CSCO', 'Supply Chain BDM', 'COO', 'CHRO', 'Customer Service BDM'],
      influencer: ['CDO', 'CTO', 'CIO', 'COO']
    },
    priorities: [
      'Increase conversion rates and customer engagement',
      'Reduce production and creative costs',
      'Improve operational efficiency',
      'Enhance customer satisfaction and retention',
      'Optimize inventory management',
      'Boost employee productivity'
    ],
    useCases: [
      {
        name: 'AI shopping assistant',
        description: 'Apply generative AI to online shopping to create interactive and tailored experiences that increase conversion and reduce abandoned carts.',
        solutions: [
          {
            name: 'Microsoft Copilot Studio',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-copilot/microsoft-copilot-studio' }]
          },
          {
            name: 'Azure OpenAI Service',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-services/openai-service' }]
          }
        ],
        customerEvidence: [
          { name: 'ASOS', solutionPlay: 'Copilot and Agents at Work', storyUrl: 'https://www.asos.com/' },
          { name: 'Clarins', solutionPlay: 'Innovate With Azure AI Apps and Agents', storyUrl: 'https://www.clarins.com/' },
          { name: 'L\'Oreal', solutionPlay: 'Innovate With Azure AI Apps and Agents', storyUrl: 'https://www.loreal.com/' },
          { name: 'Walmart', solutionPlay: 'Innovate With Azure AI Apps and Agents' }
        ]
      },
      {
        name: 'Content generation and operations',
        description: 'Drive engagement and conversion by leveraging AI to generate marketing content and campaigns, reducing time-to-market and production costs.',
        solutions: [
          {
            name: 'Microsoft 365 Copilot',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-365/copilot' }]
          },
          {
            name: 'Azure OpenAI Service',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-services/openai-service' }]
          }
        ],
        customerEvidence: [
          { name: 'Nestle', solutionPlay: 'Copilot and Agents at Work', storyUrl: 'https://www.nestle.com/' },
          { name: 'Dentsu', solutionPlay: 'Innovate With Azure AI Apps and Agents' },
          { name: 'CarMax', solutionPlay: 'Innovate With Azure AI Apps and Agents', storyUrl: 'https://www.microsoft.com/en/customers/story/1501304071775762777-carmax-retailer-azure-openai-service' }
        ]
      },
      {
        name: 'AI-assisted associates',
        description: 'Improve workforce knowledge and efficiency with a copilot for every person and an agent for every process, enhancing customer experiences and retention.',
        solutions: [
          {
            name: 'Microsoft 365 Copilot',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-365/copilot' }]
          },
          {
            name: 'Microsoft Copilot Studio',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-copilot/microsoft-copilot-studio' }]
          }
        ],
        customerEvidence: [
          { name: 'Canadian Tire', solutionPlay: 'Copilot and Agents at Work' },
          { name: 'Lindex', solutionPlay: 'Innovate With Azure AI Apps and Agents' },
          { name: 'Tractor Supply', solutionPlay: 'Innovate With Azure AI Apps and Agents' }
        ]
      }
    ]
  },
  'Consumer Goods': {
    name: 'Consumer Goods',
    personas: {
      buyer: ['Chief Marketing Officer', 'Chief Growth Officer', 'VP of R&D', 'VP of Manufacturing', 'Chief Supply Chain Officer'],
      influencer: ['Chief Sales Officer', 'Chief Information Officer']
    },
    priorities: [
      'Faster content and lower costs',
      'Accelerated time-to-market',
      'Increased conversion rates',
      'Improved operational efficiency',
      'Optimized pricing strategy',
      'Increased sales revenue'
    ],
    useCases: [
      {
        name: 'Content generation and operations',
        description: 'Supercharge the end-to-end marketing process with streamlined content, campaign, localization, and brand support using AI.',
        solutions: [
          {
            name: 'Microsoft 365 Copilot',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-365/copilot' }]
          },
          {
            name: 'Azure OpenAI Service',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-services/openai-service' }]
          }
        ],
        customerEvidence: [
          { name: 'Nestle', solutionPlay: 'Innovate with Azure AI Apps and Agents', storyUrl: 'https://www.nestle.com/' },
          { name: 'Reckitt', solutionPlay: 'Innovate with Azure AI Apps and Agents' }
        ]
      },
      {
        name: 'Interactive brand and product assistant',
        description: 'Drive conversational discovery, engagement and conversion by enhancing product discoverability with the latest AI models.',
        solutions: [
          {
            name: 'Microsoft Copilot Studio',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-copilot/microsoft-copilot-studio' }]
          },
          {
            name: 'Azure AI Foundry',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-foundry' }]
          }
        ],
        customerEvidence: [
          { name: 'Amorepacific', solutionPlay: 'Innovate with Azure AI Apps and Agents', storyUrl: 'https://www.amorepacific.com/' },
          { name: 'Clarins', solutionPlay: 'Innovate with Azure AI Apps and Agents' },
          { name: 'L\'Oreal', solutionPlay: 'Innovate with Azure AI Apps and Agents' }
        ]
      },
      {
        name: 'Optimize factory operations',
        description: 'Unify facility and factory data to enable production visibility, conduct root cause analysis, and improve worker collaboration.',
        solutions: [
          {
            name: 'Microsoft Copilot Studio',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-copilot/microsoft-copilot-studio' }]
          },
          {
            name: 'Azure AI Services',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-services' }]
          },
          {
            name: 'Microsoft Fabric',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-fabric' }]
          }
        ],
        customerEvidence: [
          { name: 'IPG', solutionPlay: 'Copilot and Agents at Work' },
          { name: 'Kraft-Heinz', solutionPlay: 'Innovate with Azure AI Apps and Agents' },
          { name: 'Carlsberg', solutionPlay: 'Innovate with Azure AI Apps and Agents', storyUrl: 'https://www.carlsberggroup.com/' }
        ]
      }
    ]
  },
  'Manufacturing & Mobility': {
    name: 'Manufacturing & Mobility',
    personas: {
      buyer: ['Chief Product Officer', 'VP of Product Development', 'VP of Engineering', 'VP of R&D', 'Chief Operating Officer', 'VP of Production', 'Factory Manager'],
      influencer: ['VP of Information Security', 'VP of Service', 'VP of Compliance and Security']
    },
    priorities: [
      'Faster time to market',
      'Reduced design and development costs',
      'Improved equipment uptime and OEE',
      'Enhanced knowledge sharing',
      'Improved factory safety',
      'Increased sales efficiency'
    ],
    useCases: [
      {
        name: 'Accelerate product development with generative AI',
        description: 'Improve efficiency with real-time iterative product designs and computer-aided design (CAD) models in real-time.',
        solutions: [
          {
            name: 'Azure OpenAI Service',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-services/openai-service' }]
          },
          {
            name: 'Microsoft Copilot',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-copilot' }]
          },
          {
            name: 'Microsoft Copilot Studio',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-copilot/microsoft-copilot-studio' }]
          }
        ],
        customerEvidence: [
          { name: 'Harting', solutionPlay: 'Innovate with Azure AI Apps and Agents' },
          { name: 'Bayer', solutionPlay: 'Copilot and Agents at Work' }
        ]
      },
      {
        name: 'Transform factory operations with real-time data',
        description: 'Unify facility and factory data to enable production visibility, conduct root cause analysis, and improve worker collaboration.',
        solutions: [
          {
            name: 'Microsoft Fabric',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-fabric' }]
          },
          {
            name: 'Azure OpenAI Service',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-services/openai-service' }]
          },
          {
            name: 'Microsoft Copilot Studio',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-copilot/microsoft-copilot-studio' }]
          }
        ],
        customerEvidence: [
          { name: 'Bridgestone', solutionPlay: 'Unify your Data Platform', storyUrl: 'https://www.bridgestone.com/' },
          { name: 'IPG', solutionPlay: 'Innovate with Azure AI Apps and Agents' }
        ]
      },
      {
        name: 'Empower sales and service teams',
        description: 'Enable production decision-making and insights by making product, asset, process, and supply chain information discoverable.',
        solutions: [
          {
            name: 'Microsoft 365 Copilot',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-365/copilot' }]
          },
          {
            name: 'Dynamics 365 Sales',
            links: [{ type: 'Demo', url: 'https://dynamics.microsoft.com/en-us/sales/overview/' }]
          },
          {
            name: 'Dynamics 365 Contact Center',
            links: [{ type: 'Demo', url: 'https://dynamics.microsoft.com/en-us/contact-center/overview/' }]
          }
        ],
        customerEvidence: [
          { name: 'Legrand', solutionPlay: 'Innovate with Azure AI Apps and Agents' },
          { name: 'Lenovo', solutionPlay: 'Service Transformation with AI' }
        ]
      }
    ]
  },
  'Energy & Resources': {
    name: 'Energy & Resources',
    personas: {
      buyer: ['CIO', 'CTO', 'CISO', 'COO', 'VP Engineering', 'VP Product Management'],
      influencer: ['CEO', 'CFO', 'Legal and Regulatory Affairs', 'Strategy and Planning Teams', 'Chief Sustainability Officer', 'Geologists', 'Geophysicists']
    },
    priorities: [
      'Operational stability and reduced downtime',
      'Cost savings and efficiency',
      'Increased productivity and safety',
      'Enhanced resilience and forecasting',
      'Faster time to market',
      'Improved knowledge sharing'
    ],
    useCases: [
      {
        name: 'Protect critical infrastructure',
        description: 'Quickly identify, assess, and respond to security risks to increase grid and operational resiliency.',
        solutions: [
          {
            name: 'Security Copilot',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/security/business/ai-machine-learning/microsoft-security-copilot' }]
          },
          {
            name: 'Defender for IoT',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/security/business/endpoint-security/microsoft-defender-iot' }]
          },
          {
            name: 'Microsoft Sentinel',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/security/business/siem-and-xdr/microsoft-sentinel' }]
          }
        ],
        customerEvidence: [
          { name: 'Uniper', solutionPlay: 'Unify your data platform', storyUrl: 'https://www.uniper.energy/' },
          { name: 'Galp Energia', solutionPlay: 'Copilot and agents at work' }
        ]
      },
      {
        name: 'Improve frontline worker productivity',
        description: 'Empower frontline workers with AI solutions that automate workflows and provide real-time, actionable insights.',
        solutions: [
          {
            name: 'Microsoft 365 Copilot',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-365/copilot' }]
          },
          {
            name: 'Microsoft Copilot Studio',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-copilot/microsoft-copilot-studio' }]
          },
          {
            name: 'Dynamics 365 Field Service',
            links: [{ type: 'Demo', url: 'https://dynamics.microsoft.com/en-us/field-service/overview/' }]
          }
        ],
        customerEvidence: [
          { name: 'Ma\'aden', solutionPlay: 'Copilot and agents at work' },
          { name: 'Centrica', solutionPlay: 'Copilot and agents at work' },
          { name: 'Pacific Gas & Electric', solutionPlay: 'Copilot and agents at work' }
        ]
      },
      {
        name: 'Enhance resilience with AI-powered forecasting',
        description: 'Improve real-time performance monitoring to assess and manage risk associated with equipment maintenance, weather, and wildfires.',
        solutions: [
          {
            name: 'Azure Machine Learning',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/machine-learning' }]
          },
          {
            name: 'Azure OpenAI Service',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-services/openai-service' }]
          },
          {
            name: 'Azure Digital Twins',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/digital-twins' }]
          }
        ],
        customerEvidence: [
          { name: 'Enerjisa Uretim', solutionPlay: 'Unify your data platform' },
          { name: 'Petronas', solutionPlay: 'Unify your data platform' },
          { name: 'SSE', solutionPlay: 'Unify your data platform' }
        ]
      }
    ]
  },
  'Telecommunications': {
    name: 'Telecommunications',
    personas: {
      buyer: ['CCO', 'CISO', 'CPO', 'CNO', 'COO', 'CSO', 'CFO'],
      influencer: ['CEO', 'CIO', 'CFO', 'CTO', 'CMO']
    },
    priorities: [
      'Increase contact center service efficiency',
      'Strengthen loyalty and customer satisfaction',
      'Streamline operations and boost productivity',
      'Scale AI-driven network management',
      'Improve network visibility and uptime',
      'Strengthen cybersecurity posture'
    ],
    useCases: [
      {
        name: 'Improve subscriber satisfaction',
        description: 'Transform contact center operations and accelerate response times by proactively identifying issues, surfacing real-time insights, and enabling agents with personalized guidance.',
        solutions: [
          {
            name: 'Azure AI Foundry',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-foundry' }]
          },
          {
            name: 'Azure OpenAI Service',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-services/openai-service' }]
          },
          {
            name: 'Dynamics 365',
            links: [{ type: 'Demo', url: 'https://dynamics.microsoft.com/' }]
          }
        ],
        customerEvidence: [
          { name: 'AT&T', solutionPlay: 'Service Transformation with AI', storyUrl: 'https://www.microsoft.com/en/customers/story/1637511309136244127-att-telecommunications-azure-openai-service' },
          { name: 'Telstra', solutionPlay: 'Innovate with Azure AI Apps and Agents' },
          { name: 'Vodafone', solutionPlay: 'Copilot and Agents at Work', storyUrl: 'https://www.microsoft.com/en/customers/story/19346-vodafone-microsoft-365-copilot' }
        ]
      },
      {
        name: 'Enhance productivity with AI automation',
        description: 'Use AI to personalize subscriber engagement and empower employees—delivering context-aware experiences that boost satisfaction and loyalty.',
        solutions: [
          {
            name: 'Microsoft 365 Copilot',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-365/copilot' }]
          },
          {
            name: 'GitHub Copilot',
            links: [{ type: 'Demo', url: 'https://github.com/features/copilot' }]
          }
        ],
        customerEvidence: [
          { name: 'Vodafone', solutionPlay: 'Copilot and Agents at Work', storyUrl: 'https://www.microsoft.com/en/customers/story/19346-vodafone-microsoft-365-copilot' },
          { name: 'Lumen', solutionPlay: 'Copilot and Agents at Work', storyUrl: 'https://www.microsoft.com/en/customers/story/1771760434465986810-lumen-microsoft-copilot-telecommunications-en-united-states' },
          { name: 'BT Group', solutionPlay: 'Copilot and Agents at Work' }
        ]
      },
      {
        name: 'Automate network operations',
        description: 'Modernize network and business operations with agentic AI—enabling zero-touch issue resolution, streamlining workflows, and empowering adaptive decision-making.',
        solutions: [
          {
            name: 'Microsoft Copilot Studio',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-copilot/microsoft-copilot-studio' }]
          },
          {
            name: 'Azure AI Foundry',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-foundry' }]
          },
          {
            name: 'Microsoft Fabric',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-fabric' }]
          }
        ],
        customerEvidence: [
          { name: 'T-Mobile', solutionPlay: 'Innovate with Azure AI Apps and Agents', storyUrl: 'https://www.microsoft.com/en/customers/story/23087-t-mobile-usa-microsoft-copilot-studio' },
          { name: 'Telefonica Spain', solutionPlay: 'Unify your Data Platform' },
          { name: 'NTT Data', solutionPlay: 'Innovate with Azure AI Apps and Agents' }
        ]
      }
    ]
  },
  'Media & Entertainment': {
    name: 'Media & Entertainment',
    personas: {
      buyer: ['CEO', 'COO', 'CMO', 'Chief Commercial Officer', 'CDO'],
      influencer: ['Content creators', 'Producers', 'LOB marketing lead', 'Community engagement lead']
    },
    priorities: [
      'Drive better content and productivity',
      'Get content to market faster',
      'Lower operating costs',
      'Create personalized experiences',
      'Increase audience engagement',
      'Foster community loyalty'
    ],
    useCases: [
      {
        name: 'Transform the creative process',
        description: 'Use AI to innovate and optimize creative workflows, empowering your content teams to focus on higher-value work.',
        solutions: [
          {
            name: 'Azure OpenAI Service',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-services/openai-service' }]
          },
          {
            name: 'Microsoft 365 Copilot',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-365/copilot' }]
          },
          {
            name: 'Azure AI Video Indexer',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-services/ai-video-indexer' }]
          }
        ],
        customerEvidence: [
          { name: 'Avid', solutionPlay: 'Copilot and Agents at work' },
          { name: 'Adobe', solutionPlay: 'Innovate with Low Code AI and Agents' }
        ]
      },
      {
        name: 'Streamline content production and distribution',
        description: 'Integrate AI across your content and production workflows to optimize project management, reduce legal risk, improve accessibility, and protect valuable IP.',
        solutions: [
          {
            name: 'Microsoft 365 Copilot',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-365/copilot' }]
          },
          {
            name: 'Azure AI Video Indexer',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-services/ai-video-indexer' }]
          },
          {
            name: 'Microsoft Fabric',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-fabric' }]
          }
        ],
        customerEvidence: [
          { name: 'Evertz', solutionPlay: 'Unify your data platform' },
          { name: 'MediaKind', solutionPlay: 'Copilot and Agents at work' }
        ]
      },
      {
        name: 'Create personalized experiences',
        description: 'Gain instant, deep insights into audience behavior and market trends with AI analytics and develop highly-relevant ads and revenue streams.',
        solutions: [
          {
            name: 'Microsoft Fabric',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-fabric' }]
          },
          {
            name: 'Azure AI Foundry',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-foundry' }]
          },
          {
            name: 'Azure OpenAI Service',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-services/openai-service' }]
          }
        ],
        customerEvidence: [
          { name: 'Adobe', solutionPlay: 'Innovate with Azure AI apps and Agents' },
          { name: 'InMobi', solutionPlay: 'Unify your data platform' }
        ]
      }
    ]
  },
  'Government': {
    name: 'Government',
    personas: {
      buyer: ['Agency/Department Head', 'COO', 'CDO', 'CTO', 'CISO', 'Commissioner', 'Minister'],
      influencer: ['Service Lead', 'IT Managers', 'Social Services Case Workers', 'Compliance Officers']
    },
    priorities: [
      'Enhance decision making through data analytics',
      'Improve collaboration and reduce administrative tasks',
      'Modernize contact centers and resident engagement',
      'Strengthen environmental resilience',
      'Enhance cybersecurity and threat detection',
      'Automate governance and data compliance'
    ],
    useCases: [
      {
        name: 'Automate administrative tasks',
        description: 'Boost employee productivity using generative AI tools to automate administrative tasks, improve quality of content, and free up time to focus on higher-value activities.',
        solutions: [
          {
            name: 'Microsoft 365 Copilot',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-365/copilot' }]
          },
          {
            name: 'Microsoft Copilot Studio',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-copilot/microsoft-copilot-studio' }]
          }
        ],
        customerEvidence: [
          { name: 'Torfaen County Borough Council', solutionPlay: 'Copilot and Agents at Work' },
          { name: 'City of Burlington', solutionPlay: 'Copilot and Agents at Work' }
        ]
      },
      {
        name: 'AI-powered real-time citizen services',
        description: 'Enable personalized government programs and experiences using data-driven insights. Facilitate inclusive, equitable access to government services through innovative technology.',
        solutions: [
          {
            name: 'Microsoft Copilot Studio',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-copilot/microsoft-copilot-studio' }]
          },
          {
            name: 'Dynamics 365',
            links: [{ type: 'Demo', url: 'https://dynamics.microsoft.com/' }]
          }
        ],
        customerEvidence: [
          { name: 'Région Sud', solutionPlay: 'Service Transformation with AI' },
          { name: 'Buenos Aires City', solutionPlay: 'Service Transformation with AI' }
        ]
      },
      {
        name: 'Accelerate agency decisions with unified data',
        description: 'Facilitate timely, efficient and informed decisions supported by AI-driven tools that help decision makers analyze data at scale.',
        solutions: [
          {
            name: 'Microsoft Fabric',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-fabric' }]
          },
          {
            name: 'Azure AI Services',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-services' }]
          }
        ],
        customerEvidence: [
          { name: 'Dubai Electricity and Water Authority', solutionPlay: 'Unify your data platform' },
          { name: 'CHU Montpellier', solutionPlay: 'Unify your data platform' }
        ]
      },
      {
        name: 'Safeguard government systems with AI security',
        description: 'Deliver enhanced cybersecurity protection by leveraging AI to detect threats and secure government systems and public data.',
        solutions: [
          {
            name: 'Security Copilot',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/security/business/ai-machine-learning/microsoft-security-copilot' }]
          },
          {
            name: 'Microsoft Sentinel',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/security/business/siem-and-xdr/microsoft-sentinel' }]
          }
        ],
        customerEvidence: [
          { name: 'Dominican Republic CNCS', solutionPlay: 'Modern SecOps with Unified Platform' },
          { name: 'Government of Albania', solutionPlay: 'Modern SecOps with Unified Platform' }
        ]
      }
    ]
  },
  'Education': {
    name: 'Education',
    personas: {
      buyer: ['Superintendent', 'Director', 'CAO', 'CIO', 'CISO', 'Provost', 'Dean', 'Vice Chancellor'],
      influencer: ['Educators', 'Instructional Technologists', 'IT Admins', 'Faculty and Staff', 'Students']
    },
    priorities: [
      'Improved learning outcomes and accessibility',
      'Increased student confidence and engagement',
      'Improved career readiness and AI literacy',
      'More time for educators on what matters most',
      'Improved efficiency and cost savings',
      'Higher community satisfaction'
    ],
    useCases: [
      {
        name: 'Provide 24/7 personalized learning',
        description: 'Make tutoring, coaching, and practice support available and accessible for learners at any time, for any level and subject, in any language.',
        solutions: [
          {
            name: 'Microsoft 365 Copilot',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-365/copilot' }]
          },
          {
            name: 'Microsoft Copilot Studio',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-copilot/microsoft-copilot-studio' }]
          },
          {
            name: 'Azure AI Foundry',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-foundry' }]
          }
        ],
        customerEvidence: [
          { name: 'Taiwan MoE', solutionPlay: 'Innovate w/ Azure AI apps', storyUrl: 'https://www.edu.tw/' },
          { name: 'Khan Academy', solutionPlay: 'Innovate w/ Low Code AI' }
        ]
      },
      {
        name: 'Prepare students for future success',
        description: 'Help students build career-ready skills to thrive in the future of work and society. Grow AI literacy and increase student agency.',
        solutions: [
          {
            name: 'GitHub Copilot',
            links: [{ type: 'Demo', url: 'https://github.com/features/copilot' }]
          },
          {
            name: 'Microsoft 365 Copilot',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-365/copilot' }]
          },
          {
            name: 'Azure AI Foundry',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-foundry' }]
          }
        ],
        customerEvidence: [
          { name: 'Kent School District', solutionPlay: 'Copilot and Agents at Work' },
          { name: 'National Youth Theatre', solutionPlay: 'Secure AI Productivity' }
        ]
      },
      {
        name: 'Enhance instruction and empower educators',
        description: 'Enhance instruction with streamlined class preparation, differentiated content, and adaptive tools with insights that empower educators to focus on what matters most.',
        solutions: [
          {
            name: 'Microsoft 365 Copilot',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-365/copilot' }]
          },
          {
            name: 'Microsoft Copilot Studio',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-copilot/microsoft-copilot-studio' }]
          }
        ],
        customerEvidence: [
          { name: 'Ireland Education Authority', solutionPlay: 'Copilot and Agents at Work' },
          { name: 'Kahoot!', solutionPlay: 'Innovate w/ Low Code AI' }
        ]
      },
      {
        name: 'Transform teaching and research',
        description: 'Streamline course design and preparation, provide engaging and hands-on experiences for students. Drive innovative research with reimagined workflows.',
        solutions: [
          {
            name: 'Microsoft 365 Copilot',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-365/copilot' }]
          },
          {
            name: 'Azure AI Foundry',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-foundry' }]
          },
          {
            name: 'GitHub Copilot',
            links: [{ type: 'Demo', url: 'https://github.com/features/copilot' }]
          }
        ],
        customerEvidence: [
          { name: 'Auburn University', solutionPlay: 'Copilot and Agents at Work', storyUrl: 'https://www.auburn.edu/' },
          { name: 'University of Sydney', solutionPlay: 'Innovate w/ Azure AI apps' },
          { name: 'Tec de Monterrey', solutionPlay: 'Innovate w/ Azure AI apps' }
        ]
      }
    ]
  },
  'Nonprofit': {
    name: 'Nonprofit',
    personas: {
      buyer: ['Director of Operations', 'Program Director', 'Compliance Directors', 'Operations Managers', 'Finance Director', 'CTO', 'Chief Risk Officer'],
      influencer: ['Case Manager', 'Customer Support', 'Social Services Case Workers', 'Compliance Officers', 'Legal Teams']
    },
    priorities: [
      'Reduced administrative burden',
      'Faster access to insights',
      'Improved program efficiency',
      'Proactive risk mitigation',
      'Data-informed strategic planning',
      'Faster, fairer case resolution'
    ],
    useCases: [
      {
        name: 'Automate manual nonprofit program operations',
        description: 'Use AI to analyze patterns, classify and map data, and automate decision-making across operational workflows. Optimize resource allocation and streamline processing.',
        solutions: [
          {
            name: 'Azure AI Services',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-services' }]
          },
          {
            name: 'Azure OpenAI Service',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-services/openai-service' }]
          }
        ],
        customerEvidence: [
          { name: 'Goodwill', solutionPlay: 'Unify Your Intelligent Data', storyUrl: 'https://www.goodwill.org/' },
          { name: 'De Alliante', solutionPlay: 'Unify Your Intelligent Data' }
        ]
      },
      {
        name: 'Translate program data and documents',
        description: 'Enhance document accuracy, compliance, and multilingual translation with AI-powered automation. Remove communication gaps and improve accessibility.',
        solutions: [
          {
            name: 'Azure OpenAI Service',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-services/openai-service' }]
          },
          {
            name: 'Azure AI Speech',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-services/ai-speech' }]
          },
          {
            name: 'Microsoft Fabric',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-fabric' }]
          }
        ],
        customerEvidence: [
          { name: 'Operation Smile', solutionPlay: 'Innovate with Low Code AI and Agents' },
          { name: 'Age UK', solutionPlay: 'Innovate with Low Code AI and Agents' }
        ]
      },
      {
        name: 'Improve frontline response and resource allocation',
        description: 'AI-driven predictive analytics identifies emerging risks and drives data-informed decision-making. Proactively mitigate threats and enhance long-term strategic planning.',
        solutions: [
          {
            name: 'Azure OpenAI Service',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-services/openai-service' }]
          },
          {
            name: 'Microsoft 365 Copilot',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-365/copilot' }]
          }
        ],
        customerEvidence: [
          { name: 'Head Start Homes', solutionPlay: 'Copilot and Agents at Work' },
          { name: 'Degrees of Change', solutionPlay: 'Copilot and Agents at Work' }
        ]
      },
      {
        name: 'Streamline operations with AI-powered case management',
        description: 'AI improves case management efficiency, accelerates approvals and enhances case resolution by reducing time-consuming manual work.',
        solutions: [
          {
            name: 'Azure AI Services',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-services' }]
          },
          {
            name: 'Microsoft Fabric',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-fabric' }]
          }
        ],
        customerEvidence: [
          { name: 'Goodwill of Orange County', solutionPlay: 'Unify Your Intelligent Platform' },
          { name: 'Arcare', solutionPlay: 'Unify Your Intelligent Platform' }
        ]
      }
    ]
  }
};
