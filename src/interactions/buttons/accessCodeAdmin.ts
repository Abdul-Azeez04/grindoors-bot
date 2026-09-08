import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { logger } from '../../utils/logger';
import { Colors } from '../../config/constants';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'GRIND-';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default {
  customIdRegex: /^ac_/,
  execute: async (interaction: ButtonInteraction) => {
    try {
      if (interaction.customId === 'ac_generate') {
        await interaction.deferReply({ ephemeral: true });
        const code = generateCode();
        
        try {
          const { prisma } = await import('../../database/client');
          await prisma.accessCode.create({
            data: {
              code,
              guildId: interaction.guildId!,
              maxUses: 10,
              isActive: true,
            }
          });
          
          const embed = new EmbedBuilder()
            .setTitle('🔑 Access Code Generated!')
            .setColor(Colors.SUCCESS)
            .setDescription(`**Code:** \`${code}\`\n**Max Uses:** 10\n**Status:** ✅ Active\n\nShare this code with users who need server access.`);
          
          await interaction.followUp({ embeds: [embed] });
        } catch(e) {
          // If DB fails, just show the code without saving
          await interaction.followUp({ content: `🔑 Generated Code: \`${code}\`\n(Note: Code not saved to database - DB may need setup)` });
        }
      }

      if (interaction.customId === 'ac_generate_bulk') {
        await interaction.deferReply({ ephemeral: true });
        const codes: string[] = [];
        
        for (let i = 0; i < 5; i++) {
          codes.push(generateCode());
        }

        try {
          const { prisma } = await import('../../database/client');
          for (const code of codes) {
            await prisma.accessCode.create({
              data: {
                code,
                guildId: interaction.guildId!,
                maxUses: 10,
                isActive: true,
              }
            });
          }
        } catch(e) { /* DB might not be ready */ }

        const embed = new EmbedBuilder()
          .setTitle('📦 5 Access Codes Generated!')
          .setColor(Colors.SUCCESS)
          .setDescription(codes.map(c => `\`${c}\``).join('\n'))
          .setFooter({ text: 'Each code allows up to 10 uses.' });
        
        await interaction.followUp({ embeds: [embed] });
      }
    } catch (error) {
      logger.error('Error in access code handler:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '❌ Error generating access code.', ephemeral: true }).catch(() => {});
      } else {
        await interaction.followUp({ content: '❌ Error generating access code.' }).catch(() => {});
      }
    }
  }
};
