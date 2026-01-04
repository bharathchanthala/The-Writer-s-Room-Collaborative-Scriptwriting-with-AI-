import React from 'react';

const Conversation = () => {
  const conversationData = [
    {
      speaker: "Eli",
      text: `I nod slowly, my eyes scanning the area where Lila is pointing. I can see a faint glow emanating from behind a thick veil of foliage. My instincts tell me it's not just any ordinary light source.
      
      "Wait," I whisper to Lila, holding up a hand for her to stay still. "Let's approach cautiously."
      
      Lila's eyes sparkle with excitement as she nods, and together we creep forward, our senses on high alert. The air around us seems to thicken, as if the very forest itself is watching us.
      
      As we draw closer to the source of the light, I can feel a strange energy building in my chest. It's a sensation I've experienced before, one that tells me we're getting close to something truly remarkable.
      
      "What do you think it is?" Lila whispers, her voice barely audible over the rustling of leaves.
      
      I shake my head, still trying to process what I'm seeing. "I don't know," I admit, "but I have a feeling we're about to find out."`
    },
    {
      speaker: "Lila",
      text: `Lila's eyes light up with anticipation as she takes another step forward, her gaze fixed on the glowing area. I follow close behind her, my senses on high alert for any sign of danger.
      
      As we emerge from the trees, we're met with a breathtaking sight: a shimmering portal pulses with an otherworldly energy, illuminating the surrounding foliage like a beacon in the twilight. The air around us seems to vibrate with an electric charge, as if the very fabric of reality is being manipulated by this phenomenon.
      
      Lila's breath catches in her throat as she reaches out a hand to touch the portal. I grab her arm, holding her back. "Wait," I caution. "We don't know what's on the other side."
      
      Lila turns to me, her eyes sparkling with a mix of excitement and trepidation. "That's exactly why we have to go through it," she says, her voice barely above a whisper.
      
      I study her face, searching for any sign of uncertainty or doubt. But all I see is determination and a deep-seated curiosity. I nod slowly, knowing that Lila will stop at nothing to uncover the secrets of this mystical realm.
      
      "Okay," I say finally. "Let's do it."
      
      Together, we take a deep breath, prepare ourselves for the unknown, and step through the shimmering portal...`
    },
    {
      speaker: "Eli",
      text: `As soon as we cross the threshold, the world around us dissolves into a kaleidoscope of colors and sensations. The air is thick with an otherworldly energy that makes my skin tingle and my heart race. Lila grabs my hand, her eyes wide with wonder, as if she's experiencing something akin to a spiritual awakening.
      
      We find ourselves in a realm unlike anything I've ever seen. Towering crystal spires pierce the sky like shards of glass, refracting light into a dazzling display of colors and patterns. The ground beneath our feet is soft and spongy, like moss-covered stone, and seems to hum with a gentle vibration.
      
      Lila lets out a gasp of awe as she releases my hand and takes off in a sprint, laughing with abandon as she dances through the crystal formations. I chase after her, trying to keep up with her infectious energy.
      
      As we run, the landscape shifts and changes around us. We pass by creatures that defy explanation: winged beings that soar through the air, leaving trails of glittering stardust in their wake; massive, crystalline trees that seem to absorb and amplify the energy of the portal; and great, shimmering pools of liquid silver that reflect our images like mirrors.
      
      Lila stops suddenly, her eyes fixed on something in front of us. I catch up to her, my heart pounding with excitement, and see what's caught her attention: a glowing figure standing before us, its presence radiating an aura of ancient wisdom and power...`
    },
    // Add more entries here...
  ];

  return (
    <div className="conversation">
      {conversationData.map((entry, index) => (
        <div key={index} className={`entry ${entry.speaker.toLowerCase()}`}>
          <strong>{entry.speaker}:</strong>
          <p>{entry.text}</p>
        </div>
      ))}
    </div>
  );
};

export default Conversation;
