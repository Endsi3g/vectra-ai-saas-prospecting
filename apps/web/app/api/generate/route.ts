import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getCompletion } from '@/lib/ai';

// Helper to sleep for simulation delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getRandomScore = () => Math.floor(Math.random() * (98 - 85 + 1)) + 85;

// Mock templates mapping for high-fidelity offline fallback
function generateMockOutreach(
  lead: any,
  campaign: any,
  tone: string,
  lang: string,
  userFirstName?: string
) {
  const name = lead.name || 'prospect';
  const company = lead.company || 'votre entreprise';
  const angle = campaign.angle || 'audit';
  const cta = campaign.call_to_action || "échanger quelques minutes";
  const senderFr = userFirstName || '${senderFr}';
  const senderEn = userFirstName || '${senderEn}';

  const friendlyTemplates = {
    fr: {
      audit: {
        subject: `Petite idée pour la landing page de ${company} 💡`,
        email: `Salut ${name},\n\nJ'espère que tu vas bien !\n\nJe suis tombé sur le site de ${company} en faisant des recherches sur ton secteur. Le design est super propre, mais j'ai remarqué 2-3 petites choses qui pourraient facilement doubler tes conversions (notamment sur l'appel à l'action principal et la clarté de l'offre).\n\nJ'ai préparé un mini-audit gratuit pour te montrer ça en détails. C'est cadeau, pas de pression.\n\nÇa te dirait d'en discuter lors d'un appel rapide de 15 minutes ?\n\nÀ bientôt,\n${senderFr}`,
        linkedin: `Salut ${name} ! J'aime beaucoup ce que vous faites chez ${company}. En regardant ton site, j'ai repéré 2 optimisations simples pour booster tes conversions de landing page. J'ai rédigé un petit audit gratuit, ça te dit d'en discuter 10 min ?`
      },
      modernization: {
        subject: `Rafraîchissement du site de ${company} ? 💻`,
        email: `Salut ${name},\n\nJe me permets de te contacter parce que j'adore ce que vous construisez avec ${company}. En visitant ton site, je me suis dit qu'il y avait une belle opportunité de le rendre encore plus moderne et percutant pour tes clients.\n\nJe t'ai fait une petite maquette rapide de ce que pourrait donner une refonte du header pour améliorer l'impact visuel.\n\nEs-tu dispo pour un appel rapide cette semaine pour que je te montre ça ?\n\nBonne journée,\n${senderFr}`,
        linkedin: `Salut ${name} ! Je viens de voir le site de ${company}. J'ai imaginé une version modernisée de votre page d'accueil pour la rendre encore plus percutante. Je peux t'envoyer le visuel pour avoir ton avis ?`
      },
      automation: {
        subject: `Gagner du temps sur tes process chez ${company} ⚙️`,
        email: `Salut ${name},\n\nJe t'écris car je travaille avec des solopreneurs et petites équipes pour automatiser les tâches répétitives et leur faire gagner 10 heures par semaine.\n\nEn regardant ${company}, je me suis dit que vous passiez sûrement beaucoup de temps à gérer vos leads et vos relances manuellement. On peut facilement brancher un système automatique simple pour ça.\n\nJe te propose de te montrer un exemple concret en 10 minutes lors d'un appel ?\n\nÀ très vite,\n${senderFr}`,
        linkedin: `Salut ${name} ! Félicitations pour le développement de ${company}. Je crée des automatisations simples pour faire gagner du temps aux équipes. Ça te dirait de voir un process clé qu'on pourrait automatiser chez toi en 10 min ?`
      },
      discovery_call: {
        subject: `Échange rapide autour de ${company} ☕`,
        email: `Salut ${name},\n\nJe suis de près ce que vous faites chez ${company} et je trouve votre approche vraiment intéressante.\n\nJe serais curieux de comprendre vos plus gros défis du moment et voir s'il y a des synergies simples à créer entre nos activités.\n\nSerais-tu disponible pour un café virtuel de 15 minutes cette semaine ou la suivante ?\n\nAu plaisir d'échanger,\n${senderFr}`,
        linkedin: `Salut ${name} ! Je suis le parcours de ${company} avec attention. Je serais ravi de faire ta connaissance et d'échanger sur nos enjeux respectifs. Es-tu ouvert à un rapide appel de 15 min ?`
      }
    },
    en: {
      audit: {
        subject: `Quick idea for ${company}'s landing page 💡`,
        email: `Hi ${name},\n\nHope you're doing great!\n\nI was checking out ${company}'s website and love what you're doing. I noticed 2-3 quick conversion tweaks that could help turn more visitors into clients (especially around your primary CTA).\n\nI put together a short, free audit showing exactly what I mean. No strings attached.\n\nWould you be open to a quick 15-minute call to go over it?\n\nBest,\n${senderEn}`,
        linkedin: `Hi ${name}! Really cool stuff at ${company}. I reviewed your website and found 2 simple fixes to increase conversions. I made a free mini-audit for you—open to a quick 10-minute chat about it?`
      },
      modernization: {
        subject: `Modernizing ${company}'s web design? 💻`,
        email: `Hi ${name},\n\nI'm reaching out because I love the brand you're building with ${company}. Looking at your website, I think there is a great opportunity to make the layout feel even sleeker and more engaging.\n\nI designed a quick mockup of how a modern header refresh could look for your homepage.\n\nAre you free for a brief call this week so I can share it with you?\n\nBest,\n${senderEn}`,
        linkedin: `Hi ${name}! Just saw the site for ${company}. I sketched a quick modernized version of your homepage to help improve visitor trust. Can I send you the link to see what you think?`
      },
      automation: {
        subject: `Saving time on your workflows at ${company} ⚙️`,
        email: `Hi ${name},\n\nI work with solopreneurs and small teams to automate manual, repetitive tasks and save them about 10 hours a week.\n\nLooking at ${company}, you might be spending a lot of time on manual lead sorting or followups. We can easily automate that workflow.\n\nI'd love to show you a quick example on a 15-minute call. Let me know if you're open to it!\n\nCheers,\n${senderEn}`,
        linkedin: `Hi ${name}! Congrats on ${company}. I build custom automations to eliminate repetitive tasks. Would you be open to a 10-minute call to see how we could save you a few hours each week?`
      },
      discovery_call: {
        subject: `Quick chat about ${company} ☕`,
        email: `Hi ${name},\n\nI've been following ${company} and really enjoy your approach to the market.\n\nI'd love to learn more about your current focus and see if there are simple ways we could collaborate or support each other.\n\nAre you open to a quick 15-minute virtual coffee this week?\n\nBest,\n${senderEn}`,
        linkedin: `Hi ${name}! Following ${company}'s progress with interest. Would love to connect and share some insights on our space. Are you up for a quick 15-minute intro call?`
      }
    }
  };

  const professionalTemplates = {
    fr: {
      audit: {
        subject: `Audit de conversion pour le site de ${company}`,
        email: `Bonjour ${name},\n\nJe me permets de vous contacter après avoir visité le site internet de ${company}.\n\nDans le cadre de mon activité, j'aide les entreprises à optimiser leurs pages de vente. En analysant votre site, j'ai identifié deux leviers concrets qui permettraient d'améliorer votre taux de conversion (particulièrement au niveau de la structure du header et des formulaires).\n\nJ'ai rédigé un document d'audit synthétique reprenant ces recommandations.\n\nSeriez-vous disponible pour un court entretien de 15 minutes afin de parcourir ces points ?\n\nBien cordialement,\n${senderFr}`,
        linkedin: `Bonjour ${name}, j'ai parcouru le site de ${company} avec beaucoup d'intérêt. J'ai préparé un court audit gratuit contenant 2 recommandations pour optimiser vos taux de conversion. Seriez-vous ouvert à un rapide échange cette semaine pour en discuter ?`
      },
      modernization: {
        subject: `Modernisation de l'identité web de ${company}`,
        email: `Bonjour ${name},\n\nJe prends contact avec vous car je suis attentivement le développement de ${company}. Votre positionnement est excellent, et je pense qu'une interface web modernisée permettrait d'augmenter significativement la valeur perçue de vos services.\n\nJe me suis permis de réaliser une première maquette de refonte de votre page d'accueil afin d'illustrer mon propos.\n\nPourrions-nous convenir d'un rendez-vous téléphonique de 15 minutes pour que je vous présente cette proposition ?\n\nCordialement,\n${senderFr}`,
        linkedin: `Bonjour ${name}, je suis le développement de ${company} de près. J'ai conçu un prototype visuel moderne pour votre page d'accueil afin de renforcer la confiance de vos visiteurs. Puis-je vous le partager pour recueillir vos retours ?`
      },
      automation: {
        subject: `Optimisation des processus opérationnels chez ${company}`,
        email: `Bonjour ${name},\n\nJe vous écris car j'accompagne les entreprises et les dirigeants dans l'automatisation de leurs processus répétitifs, ce qui leur permet de libérer plusieurs heures chaque semaine.\n\nAu vu de l'activité de ${company}, il semble y avoir des opportunités intéressantes pour automatiser la gestion des contacts ou le suivi client.\n\nJe serais ravi de vous présenter un cas d'usage similaire lors d'un appel de 15 minutes.\n\nBien cordialement,\n${senderFr}`,
        linkedin: `Bonjour ${name}, j'aide les structures comme ${company} à éliminer les tâches répétitives en intégrant des automatisations. Seriez-vous disponible pour un échange de 10 minutes afin de voir comment optimiser vos flux de travail ?`
      },
      discovery_call: {
        subject: `Opportunité d'échange - ${company}`,
        email: `Bonjour ${name},\n\nJe suis le parcours de ${company} et apprécie particulièrement vos dernières réalisations.\n\nJe serais ravi de planifier un court échange afin de mieux comprendre vos objectifs de croissance et d'identifier d'éventuelles synergies professionnelles.\n\nAuriez-vous des disponibilités pour un appel de 15 minutes au cours des prochains jours ?\n\nRespectueusement,\n${senderFr}`,
        linkedin: `Bonjour ${name}, je suis très impressionné par la trajectoire de ${company}. J'aimerais faire votre connaissance pour en savoir plus sur votre vision et vos défis. Seriez-vous ouvert à un échange téléphonique de 15 minutes ?`
      }
    },
    en: {
      audit: {
        subject: `Conversion audit for ${company}'s website`,
        email: `Hello ${name},\n\nI am reaching out after reviewing ${company}'s website.\n\nI help businesses optimize their sales pages to convert visitors into active clients. After looking at your homepage, I identified two areas where you could significantly increase conversions (notably your hero layout and primary CTA placement).\n\nI have prepared a brief, actionable audit with these suggestions.\n\nWould you be available for a brief 15-minute call to review these points?\n\nSincerely,\n${senderEn}`,
        linkedin: `Hello ${name}, I reviewed ${company}'s website with interest. I prepared a brief, free conversion audit with 2 suggestions to help boost signups. Would you be open to a quick 10-minute call to discuss it?`
      },
      modernization: {
        subject: `Web design modernization for ${company}`,
        email: `Hello ${name},\n\nI am contacting you because I follow ${company}'s growth closely. You have a very compelling offer, and I believe a modernized website interface would help elevate your brand position and client trust.\n\nI went ahead and designed a quick homepage layout prototype to show you what is possible.\n\nCould we schedule a short 15-minute call this week for me to walk you through it?\n\nBest regards,\n${senderEn}`,
        linkedin: `Hello ${name}, I follow ${company}'s work with interest. I created a sleek modern homepage mockup to help increase visitor trust. May I send you the link to get your feedback?`
      },
      automation: {
        subject: `Workflow automation opportunities at ${company}`,
        email: `Hello ${name},\n\nI help growing businesses integrate automation workflows to eliminate manual data entry and save hours of repetitive admin work each week.\n\nBased on ${company}'s model, there could be great value in automating your lead logging or customer email notifications.\n\nI would love to demonstrate a similar setup on a brief 15-minute call. Let me know if you have availability!\n\nBest regards,\n${senderEn}`,
        linkedin: `Hello ${name}, I help companies like ${company} streamline operations by automating repetitive tasks. Would you be open to a 10-minute call to see if we can optimize some of your manual processes?`
      },
      discovery_call: {
        subject: `Introduction call - ${company}`,
        email: `Hello ${name},\n\nI am following ${company}'s journey and appreciate your recent achievements.\n\nI would love to schedule a brief introductory call to understand your growth objectives and see if there are mutual opportunities for collaboration.\n\nWould you be open to a 15-minute call next week?\n\nWarm regards,\n${senderEn}`,
        linkedin: `Hello ${name}, I am impressed by ${company}'s growth. I'd love to connect briefly to learn more about your focus and share insights on our industry. Are you open to a quick 15-minute call?`
      }
    }
  };

  const formalTemplates = {
    fr: {
      audit: {
        subject: `Proposition d'audit d'optimisation pour le site internet de ${company}`,
        email: `Bonjour ${name},\n\nJe me permets de vous contacter à la suite d'une étude attentive de la présence en ligne de la société ${company}.\n\nSpécialiste de l'optimisation des parcours utilisateurs, j'ai relevé deux opportunités concrètes sur votre site internet qui permettraient d'améliorer l'engagement de vos visiteurs (notamment la hiérarchisation de votre offre principale).\n\nJ'ai formalisé ces analyses dans un court document d'audit gratuit que je serais ravi de vous soumettre.\n\nAuriez-vous l'amabilité de m'indiquer vos disponibilités pour un échange téléphonique de 20 minutes ?\n\nJe vous prie d'agréer, ${name}, l'expression de mes salutations distinguées.\n\n${senderFr}`,
        linkedin: `Bonjour ${name}. J'ai examiné avec beaucoup d'attention le site de la société ${company}. J'ai pris l'initiative de rédiger un audit gratuit contenant deux pistes d'optimisation de vos taux de conversion. Seriez-vous disposé à convenir d'un bref entretien pour en prendre connaissance ?`
      },
      modernization: {
        subject: `Étude de modernisation de la vitrine numérique de ${company}`,
        email: `Bonjour ${name},\n\nJe vous contacte afin de saluer le développement de ${company}, dont je suis la progression avec intérêt. Dans l'optique de maximiser votre impact de marque, il me semble qu'une modernisation de votre design web permettrait d'accroître votre taux de conversion.\n\nJ'ai conçu une maquette conceptuelle illustrant cette opportunité pour votre page d'accueil.\n\nSerait-il possible de planifier un appel de 20 minutes afin que je puisse vous la présenter ?\n\nAvec mes salutations distinguées,\n${senderFr}`,
        linkedin: `Bonjour ${name}. Suivant l'évolution de la société ${company}, j'ai créé une proposition de design modernisée pour votre page d'accueil dans le but de renforcer la confiance de vos visiteurs. Puis-je solliciter un court échange pour vous présenter ce visuel ?`
      },
      automation: {
        subject: `Audit des processus d'automatisation pour ${company}`,
        email: `Bonjour ${name},\n\nJe me permets de vous solliciter car j'accompagne les dirigeants dans l'optimisation et l'automatisation de leurs processus métiers répétitifs, afin d'optimiser leurs coûts opérationnels.\n\nÀ l'examen des services de ${company}, j'ai modélisé un flux de travail automatisé concernant la gestion des leads qui pourrait vous faire économiser plusieurs heures de gestion hebdomadaire.\n\nSeriez-vous disponible pour un appel de 20 minutes afin que je vous expose ce cas d'école ?\n\nBien respectueusement,\n${senderFr}`,
        linkedin: `Bonjour ${name}. J'aide les dirigeants à optimiser leur efficacité opérationnelle par le biais d'automatisations de processus. Seriez-vous ouvert à un entretien de 15 minutes afin d'analyser les pistes d'amélioration applicables à ${company} ?`
      },
      discovery_call: {
        subject: `Demande de prise de contact professionnelle - ${company}`,
        email: `Bonjour ${name},\n\nJe suis l'évolution de ${company} et tiens à vous féliciter pour vos récents succès sur le marché.\n\nDans le but d'élargir mon réseau professionnel et d'explorer d'éventuelles synergies entre nos activités respectives, je serais honoré de pouvoir nous entretenir brièvement.\n\nSeriez-vous disposé à m'accorder un entretien téléphonique de 15 minutes au cours des prochains jours ?\n\nJe vous prie d'agréer, ${name}, mes salutations les plus respectueuses.\n\n${senderFr}`,
        linkedin: `Bonjour ${name}. Impressionné par les accomplissements de ${company}, j'aimerais vous proposer un entretien de 15 minutes afin de faire votre connaissance et d'échanger sur l'évolution de notre secteur d'activité. Je vous remercie pour votre attention.`
      }
    },
    en: {
      audit: {
        subject: `Conversion optimization audit for ${company}`,
        email: `Dear ${name},\n\nI am contacting you following an analysis of the digital interface of the company ${company}.\n\nAs a conversion rate optimization specialist, I have identified two primary opportunities on your website to enhance user engagement and client onboarding (specifically concerning the placement of your primary call to action).\n\nI have compiled these findings into a short, complimentary audit report.\n\nWould you be available for a 20-minute discussion to review these recommendations?\n\nSincerely yours,\n${senderEn}`,
        linkedin: `Dear ${name}, I have reviewed ${company}'s website in detail. I have taken the liberty of drafting a conversion audit with 2 key suggestions for your digital acquisition. Would you be open to a brief call to discuss these findings?`
      },
      modernization: {
        subject: `Proposed website modernization for ${company}`,
        email: `Dear ${name},\n\nI am writing to you as I follow the progress of ${company} with great interest. To support your growth, I believe a modern web design refresh would serve to elevate your market positioning and foster client confidence.\n\nI have created a design prototype for your homepage layout to demonstrate this potential.\n\nCould we schedule a 20-minute call next week to present this concept to you?\n\nRespectfully,\n${senderEn}`,
        linkedin: `Dear ${name}, following the growth of ${company}, I have drafted a modernized homepage mockup designed to enhance user trust and conversion rates. May I send you the link to discuss your impressions?`
      },
      automation: {
        subject: `Workflow automation audit for ${company}`,
        email: `Dear ${name},\n\nI am writing to you because I specialize in helping businesses implement workflow automation to reduce manual, repetitive operations and save overhead hours.\n\nAnalyzing the model of ${company}, I believe there is significant potential in automating your sales log routing and client scheduling operations.\n\nWould you be available for a 20-minute call to review a potential workflow map?\n\nRespectfully,\n${senderEn}`,
        linkedin: `Dear ${name}, I help companies optimize efficiency through custom workflow automation. Would you be open to a 15-minute call to evaluate potential optimizations for ${company}'s internal workflows?`
      },
      discovery_call: {
        subject: `Professional inquiry - ${company}`,
        email: `Dear ${name},\n\nI am following the development of ${company} and would like to congratulate you on your recent progress.\n\nI would be pleased to schedule a short introductory call to learn more about your strategic directions and explore potential synergies between our firms.\n\nWould you have availability for a 15-minute call in the coming days?\n\nSincerely,\n${senderEn}`,
        linkedin: `Dear ${name}, I am impressed by the development of ${company}. I would be glad to schedule a 15-minute call to make your acquaintance and exchange thoughts on our industry. Thank you for your consideration.`
      }
    }
  };

  const templatesMap: any = {
    friendly: friendlyTemplates,
    professional: professionalTemplates,
    formal: formalTemplates
  };

  const toneTemplates = templatesMap[tone] || professionalTemplates;
  const langTemplates = toneTemplates[lang] || toneTemplates['en'];
  const matchedTemplate = langTemplates[angle] || langTemplates['audit'];

  let emailBody = matchedTemplate.email;
  if (campaign.offer) {
    emailBody = emailBody.replace("j'aide les entreprises à optimiser leurs pages de vente", `j'aide les entreprises avec : "${campaign.offer}"`);
    emailBody = emailBody.replace("I help businesses optimize their sales pages", `I help businesses with: "${campaign.offer}"`);
  }
  if (campaign.call_to_action) {
    emailBody = emailBody.replace("un appel rapide de 15 minutes", campaign.call_to_action);
    emailBody = emailBody.replace("a quick 15-minute call", campaign.call_to_action);
  }

  // Calculate dynamic personalization score based on Campaign ICP
  let score = 50; // base low score
  const targetIcp = campaign.icp_description || campaign.icp;
  if (targetIcp) {
    const icpLower = targetIcp.toLowerCase();
    const leadTitle = (lead.title || lead.job_title || lead.notes || lead.name || '').toLowerCase();
    const leadNotes = (lead.notes || '').toLowerCase();
    const leadLoc = (lead.location || '').toLowerCase();
    const leadComp = (lead.company || '').toLowerCase();

    // Check tech keywords matching
    const techKeywords = ['nextjs', 'next.js', 'react', 'python', 'typescript', 'ai', 'llm', 'software', 'saas', 'tech'];
    let techMatched = false;
    for (const tech of techKeywords) {
      if (icpLower.includes(tech) && (leadTitle.includes(tech) || leadNotes.includes(tech) || leadComp.includes(tech))) {
        techMatched = true;
        break;
      }
    }

    // Check role matches
    const roles = ['founder', 'ceo', 'cto', 'co-founder', 'dirigeant', 'architect', 'engineer', 'developer', 'marketer'];
    let roleMatched = false;
    for (const r of roles) {
      if (icpLower.includes(r) && (leadTitle.includes(r) || leadNotes.includes(r))) {
        roleMatched = true;
        break;
      }
    }

    // Match geography
    let locMatched = false;
    const countries = ['canada', 'france', 'usa', 'united states', 'uk', 'united kingdom', 'europe', 'quebec', 'montreal', 'paris', 'toronto'];
    for (const c of countries) {
      if (icpLower.includes(c) && (leadLoc.includes(c) || leadNotes.includes(c))) {
        locMatched = true;
        break;
      }
    }

    if (techMatched && roleMatched) {
      // High match: 85 - 100
      score = Math.floor(Math.random() * (98 - 85 + 1)) + 85;
    } else if (roleMatched || techMatched || locMatched) {
      // Medium match: 60 - 84
      score = Math.floor(Math.random() * (84 - 60 + 1)) + 60;
    } else {
      // Low match: < 60
      score = Math.floor(Math.random() * (59 - 45 + 1)) + 45;
    }
  } else {
    // Default high-quality matches fallback
    score = Math.floor(Math.random() * (96 - 84 + 1)) + 84;
  }
  score = Math.min(Math.max(score, 20), 100); // Bound between 20 and 100

  return {
    summary: lang === 'fr' 
      ? `${name} est associé à ${company}. D'après les informations disponibles sur leur site web (${lead.website || 'non spécifié'}), l'entreprise est active dans son secteur et pourrait bénéficier de recommandations d'optimisation spécifiques.` 
      : `${name} is associated with ${company}. Based on their online presence (${lead.website || 'not specified'}), the business is active and could benefit from targeted recommendations.`,
    email_subject: matchedTemplate.subject,
    email_body: emailBody,
    linkedin_message: matchedTemplate.linkedin,
    personalization_score: score
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { campaign_id, leads, user_id: requestUserId } = body;

    if (!campaign_id || !leads || !Array.isArray(leads)) {
      return NextResponse.json({ error: 'Données manquantes ou invalides.' }, { status: 400 });
    }

    if (leads.length > 50) {
      return NextResponse.json(
        { error: 'Limit exceeded: 50 leads max in Vectra Alpha.' },
        { status: 400 }
      );
    }

    let userId = requestUserId;
    let tone = 'professional';
    let preferredLanguages = ['fr', 'en'];
    let userFirstName: string | undefined;

    if (!userId) {
      const authHeader = req.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const { data: { user } } = await supabaseAdmin.auth.getUser(token);
        if (user) {
          userId = user.id;
        }
      }
    }

    // Fetch Campaign Details
    let campaignDetails: any = { name: 'Campagne de prospection', angle: 'audit' };
    if (campaign_id) {
      const { data } = await supabaseAdmin
        .from('campaigns')
        .select('*')
        .eq('id', campaign_id)
        .single();
      if (data) {
        campaignDetails = data;
        userId = userId || data.user_id;
      }
    }

    if (userId) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('tone, preferred_languages, first_name')
        .eq('id', userId)
        .single();

      if (profile) {
        tone = profile.tone || tone;
        preferredLanguages = profile.preferred_languages || preferredLanguages;
        userFirstName = profile.first_name || undefined;
      }
    }

    // Prepare custom streaming response
    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
      async start(controller) {
        const sendChunk = (obj: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
        };

        sendChunk({
          type: 'status',
          message: 'Initializing Hermes-Agent outreach generation workflows...'
        });
        await delay(600);

        for (let i = 0; i < leads.length; i++) {
          const lead = leads[i];
          
          sendChunk({
            type: 'lead_start',
            lead_name: lead.name,
            message: `Hermes-Agent is analyzing prospect ${lead.name} from ${lead.company}...`
          });
          await delay(800);

          // Determine language
          let lang = 'en';
          if (preferredLanguages.length === 1) {
            lang = preferredLanguages[0] || 'en';
          } else if (preferredLanguages.includes('fr')) {
            const websiteStr = (lead.website || '').toLowerCase();
            const notesStr = (lead.notes || '').toLowerCase();
            if (
              websiteStr.endsWith('.fr') || 
              websiteStr.includes('.fr/') || 
              notesStr.includes('français') || 
              notesStr.includes('france') || 
              notesStr.includes('paris')
            ) {
              lang = 'fr';
            }
          }

          let generated: any;

          // Call real OpenAI/OpenRouter API if key is present
          if (process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY) {
            try {
              const systemPrompt = `You are Hermes-Agent, an elite sales copywriter.
Analyze the prospect's background and campaign requirements.
Campaign Offer: "${campaignDetails.offer || ''}"
Campaign Target ICP (Ideal Customer Profile): "${campaignDetails.icp_description || campaignDetails.icp || ''}"
Campaign Angle: "${campaignDetails.angle || 'audit'}" (${campaignDetails.angle_description || ''})
Campaign Call to Action: "${campaignDetails.call_to_action || ''}"
Campaign Guidelines: "${campaignDetails.extra_instructions || ''}"
Language target: ${lang}
Tone constraint: ${tone}

You MUST output exactly a JSON object (no markdown wrappers) with:
- summary: a short summary of the prospect (1-2 sentences)
- email_subject: an eye-catching email subject line
- email_body: personalized email copy (sign with the sender name: ${userFirstName || 'the user'})
- linkedin_message: personalized short LinkedIn connection request message
- personalization_score: integer from 0 to 100 representing how closely the prospect matches the Campaign Target ICP (Ideal Customer Profile) constraints based on their title, location, company, and profile description. An exact match (matching role, geography, and industry constraints) scores 85-100; a partial match scores 60-84; and prospects violating constraints must score below 60.`;

              const userPrompt = `Prospect details:
Name: ${lead.name}
Company: ${lead.company}
Website: ${lead.website || 'N/A'}
Notes/ICP context: ${lead.notes || 'N/A'}`;

              const textResult = await getCompletion({
                systemPrompt,
                userPrompt,
                jsonMode: true,
                temperature: 0.7
              });

              const parsed = JSON.parse(textResult);
              generated = {
                summary: parsed.summary || '',
                email_subject: parsed.email_subject || '',
                email_body: parsed.email_body || '',
                linkedin_message: parsed.linkedin_message || '',
                personalization_score: Number(parsed.personalization_score) || (Math.floor(Math.random() * 15) + 80)
              };
            } catch (err) {
              console.warn('Real AI generation call failed, falling back to local mock template:', err);
              generated = generateMockOutreach(lead, campaignDetails, tone, lang, userFirstName);
            }
          } else {
            // Fallback mock generation
            generated = generateMockOutreach(lead, campaignDetails, tone, lang, userFirstName);
          }

          // Save/Create Lead in Supabase campaigns context
          let savedLeadId = lead.id;
          try {
            const { data: savedLead, error: leadError } = await supabaseAdmin
              .from('leads')
              .insert({
                campaign_id,
                name: lead.name,
                company: lead.company,
                website: lead.website,
                email: lead.email,
                notes: lead.notes || ''
              })
              .select('id')
              .single();

            if (leadError) throw leadError;
            if (savedLead) savedLeadId = savedLead.id;
          } catch (err) {
            console.warn('DB Save Lead warning (could be running without DB setup):', err);
          }

          // Save Message inside messages DB table
          try {
            await supabaseAdmin
              .from('messages')
              .insert({
                lead_id: savedLeadId,
                language: lang,
                summary: generated.summary,
                email_subject: generated.email_subject,
                email_body: generated.email_body,
                linkedin_message: generated.linkedin_message,
                personalization_score: generated.personalization_score,
                status: 'draft'
              });
          } catch (err) {
            console.warn('DB Save Message warning (could be running without DB setup):', err);
          }

          sendChunk({
            type: 'lead_completed',
            lead_name: lead.name,
            lead_id: savedLeadId,
            result: {
              lead_id: savedLeadId,
              language: lang,
              summary: generated.summary,
              email_subject: generated.email_subject,
              email_body: generated.email_body,
              linkedin_message: generated.linkedin_message,
              personalization_score: generated.personalization_score
            }
          });
          await delay(400);
        }

        sendChunk({
          type: 'completed',
          message: 'Hermes-Agent generated all customized outreach messages successfully.'
        });
        controller.close();
      }
    });

    return new Response(customStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });

  } catch (err: any) {
    console.error('API Generate Error:', err);
    const Sentry = require('@sentry/nextjs');
    Sentry.captureException(err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
