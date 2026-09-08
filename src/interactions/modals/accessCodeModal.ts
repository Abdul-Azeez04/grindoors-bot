import { ModalSubmitInteraction } from 'discord.js';
import { accessCodeService } from '../../services/AccessCodeService';
import { verificationService } from '../../services/VerificationService';
import { logger } from '../../utils/logger';

export const customId = 'modal_access_code';

export const execute = async (interaction: ModalSubmitInteraction) => {
  try {
    await interaction.deferReply({ ephemeral: true });
    const code = interaction.fields.getTextInputValue('access_code_input');

    const validation = await accessCodeService.validateCode(interaction.guildId!, code, interaction.user.id);

    if (!validation.valid || !validation.accessCode) {
      return interaction.editReply('❌ Invalid or expired access code.');
    }

    await accessCodeService.useCode(validation.accessCode.id, interaction.user.id);
    await verificationService.completeVerification(interaction.guildId!, interaction.user.id);

    // Fetch fresh role list from Discord API (not cache)
    await interaction.guild?.roles.fetch();
    const member = await interaction.guild?.members.fetch(interaction.user.id);
    
    if (member) {
      let unverifiedRole = interaction.guild?.roles.cache.find(r => r.name === 'Unverified');
      let waitingRoomRole = interaction.guild?.roles.cache.find(r => r.name === 'Waiting Room');
      let memberRole = interaction.guild?.roles.cache.find(r => r.name === 'Member');
      let verifiedRole = interaction.guild?.roles.cache.find(r => r.name === 'Verified');

      // Auto-create roles if the server was wiped
      if (!memberRole && interaction.guild) {
        memberRole = await interaction.guild.roles.create({ name: 'Member', color: '#3498db' });
        logger.info('Auto-created missing Member role');
      }
      if (!verifiedRole && interaction.guild) {
        verifiedRole = await interaction.guild.roles.create({ name: 'Verified', color: '#2ecc71' });
        logger.info('Auto-created missing Verified role');
      }

      logger.info(`Role assignment for ${member.user.tag}: Unverified=${!!unverifiedRole}, WaitingRoom=${!!waitingRoomRole}, Member=${!!memberRole}, Verified=${!!verifiedRole}`);

      try {
        if (unverifiedRole) {
          await member.roles.remove(unverifiedRole);
          logger.info(`Removed Unverified role from ${member.user.tag}`);
        }
        if (waitingRoomRole) {
          await member.roles.remove(waitingRoomRole);
          logger.info(`Removed Waiting Room role from ${member.user.tag}`);
        }
        if (memberRole) {
          await member.roles.add(memberRole);
          logger.info(`Added Member role to ${member.user.tag}`);
        }
        if (verifiedRole) {
          await member.roles.add(verifiedRole);
          logger.info(`Added Verified role to ${member.user.tag}`);
        }
        if (validation.accessCode.roleId) {
          const customRole = interaction.guild?.roles.cache.get(validation.accessCode.roleId);
          if (customRole) {
            await member.roles.add(customRole);
            logger.info(`Added custom role ${customRole.name} to ${member.user.tag}`);
          }
        }
      } catch (roleError: any) {
        logger.error(`Role assignment failed: ${roleError.message}`);
        return interaction.editReply(`✅ Code accepted but role assignment failed: ${roleError.message}\nPlease ask an admin to manually assign your roles.`);
      }
    }

    await interaction.editReply('✅ Welcome to the community! You now have full access to the server.');
  } catch (error: any) {
    logger.error(`Access code modal error: ${error.message}`, error);
    if (interaction.deferred) {
      await interaction.editReply(`An error occurred: ${error.message}`);
    } else {
      await interaction.reply({ content: `An error occurred: ${error.message}`, ephemeral: true });
    }
  }
};
