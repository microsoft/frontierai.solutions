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

export interface RoleData {
  name: string;
  personas: {
    buyer: string[];
    influencer: string[];
  };
  priorities: string[];
  useCases: UseCase[];
}

export const rolesData: Record<string, RoleData> = {
  'Legal': {
    name: 'Legal',
    personas: {
      buyer: ['Chief Legal Officer', 'Chief Compliance Officer', 'SVP/VP of Compliance'],
      influencer: ['General Counsel', 'Attorney/Lawyer Team', 'Legal SMEs']
    },
    priorities: [
      'Reduce cost per internal review',
      'Reduce contract error rate',
      'Improve compliance rate',
      'Reduce outside counsel spend',
      'Increase dispute win rate'
    ],
    useCases: [
      {
        name: 'AI Optimized Contract Management',
        description: 'Condense intricate agreements, pinpoint essential clauses, flag potential risks, compare contracts, compile insights, draft clauses and research legal structures for increased velocity and better decision-making',
        solutions: [
          {
            name: 'Microsoft 365 Copilot',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-365/copilot' }]
          },
          {
            name: 'Microsoft Copilot Studio',
            links: [
              { type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-copilot/microsoft-copilot-studio' },
              { type: 'Video', url: 'https://www.microsoft.com/en-us/microsoft-copilot/microsoft-copilot-studio' }
            ]
          },
          {
            name: 'Azure AI Agent Service',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-services/ai-agent-service' }]
          }
        ],
        customerEvidence: [
          { name: 'Vodafone', solutionPlay: 'Copilot & Agents at Work', storyUrl: 'https://www.microsoft.com/en/customers/story/19346-vodafone-microsoft-365-copilot' },
          { name: 'Nagel Group', solutionPlay: 'Innovate with Low Code AI & Agents', storyUrl: 'https://www.microsoft.com/en/customers/story/1792966154673709027-nagel-group-azure-openai-service-travel-and-transportation-en-germany' },
          { name: 'Harvey', solutionPlay: 'Innovate with Azure AI Apps & Agents', storyUrl: 'https://www.microsoft.com/en/customers/story/19750-harvey-azure-open-ai-service' }
        ]
      },
      {
        name: 'Automated Compliance & Risk Management',
        description: 'Analyze large data sets, help proactively spot possible compliance issues, help respond to requests for information and enable agile and efficient actions',
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
          { name: 'Floww', solutionPlay: 'Copilot & Agents at Work', storyUrl: 'https://www.microsoft.com/en/customers/story/1773116194448771349-floww-microsoft-copilot-for-microsoft-365-banking-and-capital-markets-en-united-kingdom' },
          { name: 'Thomson Reuters', solutionPlay: 'Innovate with Low Code AI & Agents', storyUrl: 'https://legal.thomsonreuters.com/blog/thomson-reuters-microsoft-ai-integration-2024/' },
          { name: 'Grupo Bimbo', solutionPlay: 'Innovate with Azure AI Apps & Agents', storyUrl: 'https://news.microsoft.com/en-ca/features/creating-internal-solutions-at-a-global-level-grupo-bimbo-adopts-ai-to-empower-its-workforce/' }
        ]
      },
      {
        name: 'Ask Legal',
        description: 'Quickly find relevant information across sources to facilitate rapid decision making and draft guidance to verify key advisory points are clear and relevant',
        solutions: [
          {
            name: 'Microsoft 365 Copilot',
            links: [
              { type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-365/copilot' },
              { type: 'Video', url: 'https://www.microsoft.com/en-us/microsoft-365/copilot' }
            ]
          },
          {
            name: 'Microsoft Copilot Studio',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-copilot/microsoft-copilot-studio' }]
          },
          {
            name: 'Azure OpenAI',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-services/openai-service' }]
          }
        ],
        customerEvidence: [
          { name: 'DLA Piper', solutionPlay: 'Copilot & Agents at Work', storyUrl: 'https://www.microsoft.com/en/customers/story/19584-dla-piper-microsoft-365-copilot' },
          { name: 'LexisNexis', solutionPlay: 'Innovate with Low Code AI & Agents', storyUrl: 'https://www.lexisnexis.com/community/insights/legal/b/thought-leadership/posts/transforming-legal-workflows-with-ai-using-copilot-for-microsoft-365' },
          { name: 'Clifford Chance', solutionPlay: 'Innovate with Azure AI Apps & Agents', storyUrl: 'https://www.microsoft.com/en/customers/story/1708363975144162321-cliffordchance-professional-services-azure-en-united-kingdom' }
        ]
      }
    ]
  },
  'Sales': {
    name: 'Sales',
    personas: {
      buyer: ['Chief Sales/Revenue Officer', 'Head of Sales', 'SVP/VP of Sales'],
      influencer: ['Sellers', 'Sales Managers', 'Partners', 'Customers']
    },
    priorities: [
      'Decrease sales cycle length',
      'Increase proposal turn around time',
      'Increase win rate/close rate',
      'Increase net promoter score (NPS)',
      'Increase customer experience (CSAT)',
      'Increase self service completion rate',
      'Increase upsell/cross sell rate',
      'Decrease time to purchase'
    ],
    useCases: [
      {
        name: 'RFP Response Automation',
        description: 'Streamline tender and RFP responses with generative AI, delivering instant access to relevant content, tailored recommendations, and insights to craft winning proposals efficiently.',
        solutions: [
          {
            name: 'Microsoft 365 Copilot',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-365/copilot' }]
          },
          {
            name: 'Microsoft Copilot Studio',
            links: [
              { type: 'Video', url: 'https://www.microsoft.com/en-us/microsoft-copilot/microsoft-copilot-studio' },
              { type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-copilot/microsoft-copilot-studio' }
            ]
          },
          {
            name: 'Azure OpenAI',
            links: [{ type: 'Video', url: 'https://azure.microsoft.com/en-us/products/ai-services/openai-service' }]
          }
        ],
        customerEvidence: [
          { name: 'Air India', solutionPlay: 'Copilot & Agents at Work', storyUrl: 'https://www.microsoft.com/en/customers/story/1750059518785857549-airindia-microsoft-teams-travel-and-transportation-en-india' },
          { name: 'ICG', solutionPlay: 'Innovate with Low Code AI & Agents', storyUrl: 'https://www.microsoft.com/en/customers/story/23620-icg-microsoft-365-copilot' },
          { name: 'Fendahl', solutionPlay: 'Innovate with Azure AI Apps & Agents', storyUrl: 'https://www.microsoft.com/en/customers/story/1762013135187474174-fendahl-azure-openai-service-professional-services-en-india' }
        ]
      },
      {
        name: 'Always-on AI Sales Assistant',
        description: 'Enhance sales efficiency with generative AI, providing instant insights, tailored recommendations, and relevant information to accelerate deal closures',
        solutions: [
          {
            name: 'Microsoft 365 Copilot for Sales',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-365/copilot/copilot-for-sales' }]
          },
          {
            name: 'M365 Copilot for Sales in Dynamics 365 Sales',
            links: [{ type: 'Demo', url: 'https://dynamics.microsoft.com/en-us/sales/overview/' }]
          },
          {
            name: 'Microsoft Copilot Studio',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-copilot/microsoft-copilot-studio' }]
          },
          {
            name: 'Azure AI Agent Service',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-services/ai-agent-service' }]
          }
        ],
        customerEvidence: [
          { name: 'PKSHA', solutionPlay: 'Copilot & Agents at Work', storyUrl: 'https://www.microsoft.com/en/customers/story/1795890438217888078-pkshatech-microsoft-copilot-for-microsoft-365-other-en-japan' },
          { name: 'Investec', solutionPlay: 'Sales Transformation with AI', storyUrl: 'https://www.microsoft.com/en/customers/story/1777785808385732889-investec-microsoft-teams-banking-and-capital-markets-en-united-kingdom' },
          { name: 'Estee Lauder', solutionPlay: 'Innovate with Low Code AI & Agents', storyUrl: 'https://www.microsoft.com/en/customers/story/23488-the-estee-lauder-companies-microsoft-copilot-studio' },
          { name: 'Walmart', solutionPlay: 'Innovate with Azure AI Apps & Agents' }
        ]
      },
      {
        name: 'Sales AI Assistant',
        description: 'Deliver AI-powered self-service sales experiences through chat, voice, and avatar-based AI assistants.',
        solutions: [
          {
            name: 'Microsoft 365 Copilot',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-365/copilot' }]
          },
          {
            name: 'Microsoft Copilot for Sales',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-365/copilot/copilot-for-sales' }]
          },
          {
            name: 'Microsoft Copilot Studio',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-copilot/microsoft-copilot-studio' }]
          },
          {
            name: 'Azure AI Agent Service',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-services/ai-agent-service' }]
          }
        ],
        customerEvidence: [
          { name: 'Lumen', solutionPlay: 'Copilot & Agents at Work', storyUrl: 'https://www.microsoft.com/en/customers/story/1771760434465986810-lumen-microsoft-copilot-telecommunications-en-united-states' },
          { name: 'EPAM', solutionPlay: 'Copilot & Agents at Work', storyUrl: 'https://www.microsoft.com/en/customers/story/1741911751634573079-epam-dynamics-365-sales-professional-services-en-united-states' },
          { name: 'Rabobank', solutionPlay: 'Innovate with Low Code AI & Agents', storyUrl: 'https://www.microsoft.com/en/customers/story/1571328090497733071-rabobank-banking-power-platform' },
          { name: 'Virbe', solutionPlay: 'Innovate with Azure AI Apps & Agents', storyUrl: 'https://www.microsoft.com/en/customers/story/20457-virbe-azure-open-ai-service' }
        ]
      }
    ]
  },
  'HR': {
    name: 'HR',
    personas: {
      buyer: ['Chief Human Resources Officer', 'Chief People/Talent Officer', 'SVP/VP of Human Resources'],
      influencer: ['HR Managers']
    },
    priorities: [
      'Reduce admin cost per employee',
      'Increase first call resolution rate',
      'Increase employee net promoter score (eNPS)',
      'Reduce hiring costs per employee',
      'Increase employee retention',
      'Increase offer acceptance rate',
      'Increase internal promotion rate',
      'Increase transition success rate'
    ],
    useCases: [
      {
        name: 'Ask HR',
        description: 'Provide employees and partners with a self-service HR digital assistant to access relevant HR knowledge articles, create & resolve HR tickets and complete HR tasks.',
        solutions: [
          {
            name: 'Microsoft 365 Copilot',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-365/copilot' }]
          },
          {
            name: 'Microsoft Copilot Studio',
            links: [
              { type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-copilot/microsoft-copilot-studio' },
              { type: 'Solution Accelerator', url: 'https://www.microsoft.com/en-us/microsoft-copilot/microsoft-copilot-studio' }
            ]
          },
          {
            name: 'Azure AI Agent Service',
            links: [{ type: 'Partner Offers', url: 'https://azure.microsoft.com/en-us/products/ai-services/ai-agent-service' }]
          }
        ],
        customerEvidence: [
          { name: 'Atos', solutionPlay: 'Copilot & Agents at Work', storyUrl: 'https://www.microsoft.com/en/customers/story/1761681704321508161-atos-microsoft-365-copilot-professional-services-en-france' },
          { name: 'PayPal', solutionPlay: 'Innovate with Low Code AI & Agents' },
          { name: 'The ODP Corporation', solutionPlay: 'Innovate with Azure AI Apps & Agents', storyUrl: 'https://www.microsoft.com/en/customers/story/24030-the-odp-corporation-azure-ai-foundry' }
        ]
      },
      {
        name: 'AI-enabled Candidate Search and Selection',
        description: 'Enable hiring teams to streamline candidate search and selection with a digital assistant that surfaces ideal matches, automates screening processes, and provides insights for better decision-making.',
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
            name: 'Azure AI Agent Service',
            links: [{ type: 'Technical Pattern', url: 'https://azure.microsoft.com/en-us/products/ai-services/ai-agent-service' }]
          }
        ],
        customerEvidence: [
          { name: 'Motor Oil', solutionPlay: 'Copilot & Agents at Work', storyUrl: 'https://www.microsoft.com/en/customers/story/1770472924267393932-motor-oil-group-microsoft-365-energy-en-greece' },
          { name: 'PayPal', solutionPlay: 'Innovate with Low Code AI & Agents' },
          { name: 'Adecco Group', solutionPlay: 'Innovate with Azure AI Apps & Agents' }
        ]
      },
      {
        name: 'Career Development AI Assistant',
        description: 'Provide employees and partners with a self-service HR digital assistant to access relevant HR knowledge articles, create & resolve HR tickets and complete HR tasks.',
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
            name: 'Azure AI Agent Service',
            links: [{ type: 'Technical Pattern', url: 'https://azure.microsoft.com/en-us/products/ai-services/ai-agent-service' }]
          }
        ],
        customerEvidence: [
          { name: 'Motor Oil', solutionPlay: 'Copilot & Agents at Work', storyUrl: 'https://www.microsoft.com/en/customers/story/1770472924267393932-motor-oil-group-microsoft-365-energy-en-greece' },
          { name: 'Epiq', solutionPlay: 'Innovate with Low Code AI & Agents', storyUrl: 'https://www.microsoft.com/en/customers/story/23132-epiq-global-microsoft-power-platform' },
          { name: 'Adecco Group', solutionPlay: 'Innovate with Azure AI Apps & Agents' }
        ]
      }
    ]
  },
  'IT': {
    name: 'IT',
    personas: {
      buyer: ['Chief Information Officer', 'Chief Technology Officer'],
      influencer: ['IT Managers', 'Security Managers']
    },
    priorities: [
      'Reduce IT Operation Costs',
      'Increase application uptime & availability',
      'Prevent security breaches',
      'Increase self service resolution rate',
      'Reduce IT issue/ticket resolution time',
      'Increase Network/Infra reliability score'
    ],
    useCases: [
      {
        name: 'AI-enabled App Modernization',
        description: 'AI-driven guidance and analysis for applications to simplify identity lifecycle management, secure apps against evolving threats, improve workflows and efficiency, and automating code conversion, debugging, version upgrading and streamline migration tasks.',
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
            name: 'Power Apps',
            links: [{ type: 'Demo', url: 'https://powerapps.microsoft.com/' }]
          },
          {
            name: 'Azure OpenAI Service',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-services/openai-service' }]
          }
        ],
        customerEvidence: [
          { name: 'BDO', solutionPlay: 'Copilot & Agents at Work', storyUrl: 'https://www.microsoft.com/en/customers/story/1763806297989579042-bdo-dynamics-365-project-operations-professional-services-en-united-states' },
          { name: 'QNET', solutionPlay: 'Innovate with Low Code AI & Agents', storyUrl: 'https://www.microsoft.com/en/customers/story/1797704796946869974-qnet-microsoft-copilot-for-security-retailers-en-hong-kong-sar' },
          { name: 'AT&T', solutionPlay: 'Innovate with Azure AI Apps & Agents', storyUrl: 'https://www.microsoft.com/en/customers/story/1637511309136244127-att-telecommunications-azure-openai-service' }
        ]
      },
      {
        name: 'AI Helpdesk Agent',
        description: 'Automate the resolution of common IT issues, support ticket management, and provide solutions to user queries, improving response times and focus on complex challenges',
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
            name: 'Azure OpenAI Service',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-services/openai-service' }]
          }
        ],
        customerEvidence: [
          { name: 'Paysafe', solutionPlay: 'Copilot & Agents at Work', storyUrl: 'https://www.microsoft.com/en/customers/story/1781698642929941032-paysafe-microsoft-copilot-for-microsoft-365-banking-and-capital-markets-en-bulgaria' },
          { name: 'Progressive', solutionPlay: 'Innovate with Low Code AI & Agents', storyUrl: 'https://www.microsoft.com/en/customers/story/1505328570133030399-progressive-insurance' },
          { name: 'Thread', solutionPlay: 'Innovate with Azure AI Apps & Agents', storyUrl: 'https://www.microsoft.com/en/customers/story/1620830893779583117-thread-professional-services-azure-openai-service' }
        ]
      },
      {
        name: 'AI-Driven Assessment and Remediation',
        description: 'AI-driven guidance and analysis across identities, devices, data, clouds, and apps that simplify identity lifecycle management, secure apps against evolving threats, and improve workflows and efficiency.',
        solutions: [
          {
            name: 'Security Copilot',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/security/business/ai-machine-learning/microsoft-security-copilot' }]
          },
          {
            name: 'Security Copilot and Microsoft Defender External Attack Surface Management',
            links: [
              { type: 'Demo', url: 'https://www.microsoft.com/en-us/security/business/ai-machine-learning/microsoft-security-copilot' }
            ]
          },
          {
            name: 'Azure OpenAI Service',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-services/openai-service' }]
          }
        ],
        customerEvidence: [
          { name: 'Intesa Sanpaolo', solutionPlay: 'Copilot & Agents at Work', storyUrl: 'https://www.microsoft.com/en/customers/story/18745-intesa-sanpaolo-group-microsoft-copilot-for-security' },
          { name: 'NTT', solutionPlay: 'Copilot & Agents at Work', storyUrl: 'https://www.microsoft.com/en/customers/story/20383-ntt-communications-microsoft-security-copilot' },
          { name: 'Siemens', solutionPlay: 'Innovate with Azure AI Apps & Agents', storyUrl: 'https://www.microsoft.com/en/customers/story/1637783244393505156-siemens-azure-machine-learning-en' }
        ]
      }
    ]
  },
  'Marketing': {
    name: 'Marketing',
    personas: {
      buyer: ['Chief Marketing Officer', 'Chief Digital Marketing Officer', 'SVP/VP of Marketing'],
      influencer: ['Marketing Managers']
    },
    priorities: [
      'Reduce agency spend',
      'Increase customer retention',
      'Increase brand value',
      'Reduce cost per lead',
      'Increase lead conversion rate',
      'Increase revenue per lead generated'
    ],
    useCases: [
      {
        name: 'Research Agent',
        description: 'Automate market analysis, capturing customer feedback, and distilling competitive insights to drive marketing strategies based on impact and business goals.',
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
            links: [
              { type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-foundry' }
            ]
          }
        ],
        customerEvidence: [
          { name: 'FPT Software', solutionPlay: 'Copilot & Agents at Work', storyUrl: 'https://www.microsoft.com/en/customers/story/23610-fpt-software-linkedin' },
          { name: 'MCI Group', solutionPlay: 'Innovate with Low Code AI & Agents', storyUrl: 'https://www.microsoft.com/en/customers/story/21168-mci-group-microsoft-365-copilot' },
          { name: 'JATO Dynamics', solutionPlay: 'Innovate with Azure AI Apps & Agents', storyUrl: 'https://www.microsoft.com/en/customers/story/19641-jato-dynamics-azure' }
        ]
      },
      {
        name: 'AI-powered Campaign Execution',
        description: 'Develop and execute smarter, faster campaigns by automating coordination, enhancing customer experience by adapting instantly based on behavior, and generate incremental revenue through personalized product upsells.',
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
          { name: 'Kodak Alaris', solutionPlay: 'Copilot & Agents at Work', storyUrl: 'https://www.microsoft.com/en/customers/story/1739745344311781322-kodakalaris-dynamics-365-discrete-manufacturing-en-united-states' },
          { name: 'T-Mobile', solutionPlay: 'Innovate with Low Code AI & Agents', storyUrl: 'https://www.microsoft.com/en/customers/story/23087-t-mobile-usa-microsoft-copilot-studio' },
          { name: 'Coca-Cola', solutionPlay: 'Innovate with Azure AI Apps & Agents', storyUrl: 'https://www.microsoft.com/en/customers/story/22668-coca-cola-company-azure-ai-and-machine-learning' }
        ]
      },
      {
        name: 'Content Creation Assistant',
        description: 'Enhance content creation productivity, streamline production of web content, and create visual campaign assets driven by marketers\' goal-focused narratives.',
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
            name: 'Azure OpenAI Service',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-services/openai-service' }]
          }
        ],
        customerEvidence: [
          { name: 'Finastra', solutionPlay: 'Copilot & Agents at Work', storyUrl: 'https://www.microsoft.com/en/customers/story/18732-finastra-microsoft-viva-engage' },
          { name: 'Estee Lauder', solutionPlay: 'Innovate with Low Code AI & Agents', storyUrl: 'https://www.microsoft.com/en/customers/story/23488-the-estee-lauder-companies-microsoft-copilot-studio' },
          { name: 'CarMax', solutionPlay: 'Innovate with Azure AI Apps & Agents', storyUrl: 'https://www.microsoft.com/en/customers/story/1501304071775762777-carmax-retailer-azure-openai-service' }
        ]
      }
    ]
  },
  'Software Development': {
    name: 'Software Development',
    personas: {
      buyer: ['Chief Information Officer', 'Chief Technology Officer'],
      influencer: ['Software Development Managers', 'Developers']
    },
    priorities: [
      'Faster solution time-to-market',
      'Reduced development and IT Operation Costs',
      'Reduced risk of security breach',
      'Reduced shadow IT Risk',
      'Faster IT issue/ticket resolution time'
    ],
    useCases: [
      {
        name: 'Ship Software Faster, with Higher Quality',
        description: 'Boost green field app development with productivity gains across the Software Development Life Cycle: from UI wireframe generation, to enhanced code generation, security, automated testing, test data generation, and generating Infrastructure-as-Code scripts for seamless service deployment.',
        solutions: [
          {
            name: 'Microsoft 365 Copilot',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-365/copilot' }]
          },
          {
            name: 'GitHub Copilot',
            links: [{ type: 'Demo', url: 'https://github.com/features/copilot' }]
          },
          {
            name: 'Azure OpenAI Service',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-services/openai-service' }]
          }
        ],
        customerEvidence: [
          { name: 'PKSHA', solutionPlay: 'Copilot & Agents at Work', storyUrl: 'https://www.microsoft.com/en/customers/story/1795890438217888078-pkshatech-microsoft-copilot-for-microsoft-365-other-en-japan' },
          { name: 'Carlsberg Group', solutionPlay: 'Copilot & Agents at Work' },
          { name: 'Schneider Electric', solutionPlay: 'Innovate with Azure AI Apps & Agents', storyUrl: 'https://www.microsoft.com/en/customers/story/1745242950134216820-schneider-electric-azure-machine-learning-discrete-manufacturing-en-france' }
        ]
      },
      {
        name: 'Streamline Legacy App Modernization',
        description: 'Utilize AI for code analysis and reverse engineering, analyze database schemas, and generate migration scripts to minimize downtime and ensure data integrity during transitions.',
        solutions: [
          {
            name: 'Microsoft 365 Copilot',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-365/copilot' }]
          },
          {
            name: 'GitHub Copilot',
            links: [{ type: 'Demo', url: 'https://github.com/features/copilot' }]
          },
          {
            name: 'Azure OpenAI Service',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-services/openai-service' }]
          }
        ],
        customerEvidence: [
          { name: 'Accenture', solutionPlay: 'Copilot & Agents at Work' },
          { name: 'Intertech', solutionPlay: 'Copilot & Agents at Work', storyUrl: 'https://www.microsoft.com/en/customers/story/1709299867574522716-intertech-azure-professional-services-en-turkiye' },
          { name: 'Neudesic', solutionPlay: 'Innovate with Azure AI Apps & Agents' }
        ]
      },
      {
        name: 'Developer Agent',
        description: 'Enhance code documentation for better team readability, provide code explanations and best practices and develop an app to deliver configuration-specific, interactive, step-by-step troubleshooting procedures by integrating manuals and support databases.',
        solutions: [
          {
            name: 'Microsoft 365 Copilot',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-365/copilot' }]
          },
          {
            name: 'GitHub Copilot',
            links: [{ type: 'Demo', url: 'https://github.com/features/copilot' }]
          },
          {
            name: 'Azure AI Agent Service',
            links: [{ type: 'Demo', url: 'https://azure.microsoft.com/en-us/products/ai-services/ai-agent-service' }]
          }
        ],
        customerEvidence: [
          { name: 'Accenture', solutionPlay: 'Copilot & Agents at Work' },
          { name: 'HP', solutionPlay: 'Copilot & Agents at Work', storyUrl: 'https://www.microsoft.com/en/customers/story/1770317375595733395-hp-github-professional-services-en-united-states' },
          { name: 'Meesho', solutionPlay: 'Innovate with Azure AI Apps & Agents', storyUrl: 'https://www.microsoft.com/en/customers/story/1747191591416935394-meesho-azure-retail-en-india' }
        ]
      }
    ]
  },
  'Service': {
    name: 'Service',
    personas: {
      buyer: ['VP of Customer Service', 'Director of Customer Service'],
      influencer: ['Contact Center Agents', 'Contact Center Manager', 'Supervisors', 'Customers']
    },
    priorities: [
      'Increase customer experience (CSAT)',
      'Improve self-service resolution rate',
      'Increase first call resolution rate',
      'Improve issue resolution time',
      'Reduce repeat issue rate'
    ],
    useCases: [
      {
        name: 'Support Assignment - Self Service Microsoft AI Assistant',
        description: 'Deliver AI-powered self-service customer experiences through chat, voice, and avatar-based AI assistants.',
        solutions: [
          {
            name: 'Microsoft 365 Copilot',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-365/copilot' }]
          },
          {
            name: 'Dynamics 365 Contact Center',
            links: [{ type: 'Demo', url: 'https://dynamics.microsoft.com/en-us/contact-center/overview/' }]
          },
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
          { name: 'Virgin Money', solutionPlay: 'Copilot & Agents at Work', storyUrl: 'https://www.microsoft.com/en/customers/story/1795836141096013038-virgin-money-dynamics-365-customer-service-banking-and-capital-markets-en-united-kingdom' },
          { name: 'Mediterranean Shipping Company', solutionPlay: 'Service Transformation with AI', storyUrl: 'https://www.microsoft.com/en/customers/story/1752067713364605088-mediterranean-shipping-dynamics-365-customer-service-travel-and-transportation-en-switzerland' },
          { name: 'ABN AMRO', solutionPlay: 'Innovate with Low Code AI & Agents and/or Service Transformation with AI', storyUrl: 'https://www.microsoft.com/en/customers/story/19754-abn-amro-bank-microsoft-copilot-studio' },
          { name: 'Akbank', solutionPlay: 'Innovate with Azure AI Apps & Agents' }
        ]
      },
      {
        name: 'Problem Resolution - Always-on AI Assistant',
        description: 'Boost agent efficiency with generative AI, offering instant knowledge, response recommendations, and insights to accelerate issue resolution',
        solutions: [
          {
            name: 'Microsoft 365 Copilot',
            links: [{ type: 'Demo', url: 'https://www.microsoft.com/en-us/microsoft-365/copilot' }]
          },
          {
            name: 'Dynamics 365 Contact Center',
            links: [{ type: 'Demo', url: 'https://dynamics.microsoft.com/en-us/contact-center/overview/' }]
          },
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
          { name: 'Apollo', solutionPlay: 'Copilot & Agents at Work', storyUrl: 'https://www.microsoft.com/en/customers/story/1762371625245829135-apollo-dynamics-365-customer-service-professional-services-en-sweden' },
          { name: 'Mediterranean Shipping Company', solutionPlay: 'Service Transformation with AI', storyUrl: 'https://www.microsoft.com/en/customers/story/1752067713364605088-mediterranean-shipping-dynamics-365-customer-service-travel-and-transportation-en-switzerland' },
          { name: 'Mediterranean Shipping Company', solutionPlay: 'Innovate with Low Code AI & Agents and/or Service Transformation with AI', storyUrl: 'https://www.microsoft.com/en/customers/story/1752067713364605088-mediterranean-shipping-dynamics-365-customer-service-travel-and-transportation-en-switzerland' },
          { name: 'Windstream', solutionPlay: 'Innovate with Azure AI Apps & Agents', storyUrl: 'https://www.microsoft.com/en/customers/story/1724474574137515102-windstream-azure-open-ai-service-united-states' }
        ]
      }
    ]
  }
};
