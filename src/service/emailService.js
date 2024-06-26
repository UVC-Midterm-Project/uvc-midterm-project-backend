const crypto = require('crypto')

const superagent = require('superagent')

const logger = require('@lib/logger')
const envProvider = require('@provider/envProvider')

const userService = require('./userService')

const emailDao = require('@dao/emailDao')

const VerifyRequestDTO = require('@emailRequestDTO/verifyRequestDTO')
const UserReadRequestDTO = require('@userRequestDTO/userReadRequestDTO')

const { transporter } = require('@lib/connection/connectors')

const emailService = {
  sendEmail: async (sendRequestDTO, createVerifyRequestDTO) => {
    try {
      emailDao.insert(createVerifyRequestDTO)

      await transporter.sendMail({ ...sendRequestDTO })

      logger.debug(`emailService.sendEmail: 인증번호 전송 완료!! (email: ${sendRequestDTO.to})`)
    } catch (err) {
      logger.error(
        `emailService.sendEmail: ${err.message ? err.message.toString() : 'Unknown error'}`
      )
      throw err
    }
  },
  checkVerifyCode: async (verifyRequestDTO) => {
    try {
      const userRequestDTO = new UserReadRequestDTO({ id: verifyRequestDTO.userId })

      const emailResponseDTO = await emailDao.selectInfo(verifyRequestDTO)
      const userResponseDTO = await userService.info(userRequestDTO)

      if (userResponseDTO.isConfirm)
        throw new Error('emailService.checkVerifyCode: 이미 인증된 계정입니다.')

      await emailService.checkCondition(verifyRequestDTO, emailResponseDTO, userResponseDTO)

      logger.debug(`emailService.checkVerifyCode: ${JSON.stringify(emailResponseDTO)}`)
    } catch (err) {
      logger.error(
        `emailService.checkVerifyCode: ${err.message ? err.message.toString() : 'Unknown error'}`
      )
      throw err
    }
  },
  deleteVerifyData: async (verifyRequestDTO) => {
    try {
      const responseDTO = await emailDao.deleteForce(verifyRequestDTO)

      logger.debug(`emailService.deleteVerifyData: ${JSON.stringify(responseDTO)}`)

      return responseDTO
    } catch (err) {
      logger.error(
        `emailService.deleteVerifyData: ${err.message ? err.message.toString() : 'Unknown error'}`
      )

      throw err
    }
  },
  generateVerificationCode: () => {
    const codeSize = 8

    const bytes = crypto.randomBytes(codeSize)
    const verificationCode = bytes.toString('base64').slice(0, codeSize).replaceAll('/', '0')

    return verificationCode
  },
  checkCondition: async (requestData, dbData, userDTO) => {
    console.log('🚀 ~ checkCondition: ~ dbData:', dbData)
    try {
      if (
        !(dbData.id && dbData.userId && dbData.verificationCode) ||
        requestData.verificationCode !== dbData.verificationCode
      ) {
        if (dbData.verificationCode) {
          emailDao.deleteForce(new VerifyRequestDTO({ verificationCode: dbData.verificationCode }))
        }

        await superagent
          .post(`${envProvider.common.endPoint}:${envProvider.common.port}/api/email/sendEmail`)
          .send(userDTO)

        throw new Error(`emailService.checkCondition: 인증 코드가 유효하지 않습니다.`)
      }
    } catch (err) {
      logger.error(
        `emailService.checkCondition: ${err.message ? err.message.toString() : 'Unknown error'}`
      )

      throw err
    }
  },
  getEmailVerify: async (requestDTO) => {
    try {
      const responseDTO = await emailDao.selectInfo(requestDTO)

      logger.debug(`emailService.getEmailVerify: ${JSON.stringify(responseDTO)}`)

      return responseDTO
    } catch (err) {
      logger.error(
        `emailService.getEmailVerify: ${err.message ? err.message.toString() : 'Unknown error'}`
      )

      throw err
    }
  }
}

module.exports = emailService
