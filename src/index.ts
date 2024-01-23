import { App, Bot, Context, Schema, Session } from 'koishi'
import t from './recipe/recipe'
import { resolve } from 'path'
export const name = 'cookerguide'

export const usage =`
markdown模板：

        #{{.tittle}}
        !{{.imgsize}}({{.img_url}})
        > {{.text1}}
        > {{.text2}}
        > {{.text3}}
        > {{.text4}}
        > {{.text5}}
        > {{.text6}}

        {{.text7}}

本插件仅限QQ官方bot使用，且需要开启markdown权限
`

export interface Config {
  mdid: string
  key1: string
  key2: string
  key3: string
  key4: string
  key5: string
  key6: string
  key7: string
  key8: string
  key9: string
  key10: string
}

export const Config: Schema<Config> = Schema.object({
  mdid: Schema.string().required(),
  key1: Schema.string().default('tittle'),
  key2: Schema.string().default('imgsize'),
  key3: Schema.string().default('img_url'),
  key4: Schema.string().default('text1'),
  key5: Schema.string().default('text2'),
  key6: Schema.string().default('text3'),
  key7: Schema.string().default('text4'),
  key8: Schema.string().default('text5'),
  key9: Schema.string().default('text6'),
  key10: Schema.string().default('text7'),

})
let ingredients: object = {}
export function apply(ctx: Context, config: Config) {
  ctx.on('interaction/button', async (session) => {
    const { d } = session.event._data
    console.log(d.id)
    // await session.bot.internal.acknowledgeInteraction(d.id,"1")
    const Adata = d.data.resolved.button_data
    const data = Adata.split(' ')[2]
    const btnType = Adata.split(' ')[0]
    switch (btnType) {
      case '肉类':{
        const msg_id = Adata.split(' ')[1]
        const { url } = await session.app['server.temp'].create(`file://${resolve(`${__dirname}/img/1.jpg`)}`)
        const md: object = {
          content: "111",
          msg_type: 2,
          markdown: {
            custom_template_id: config.mdid,
            params: [
              {
                key: config.key1,
                values: [`选择肉类 <@${session.event.user.id}>`]
              },
              {
                key: config.key2,
                values: ["[img#512px #512px]"]
              },
              {
                key: config.key3,
                values: [url]
              },
              {
                key: config.key4,
                values: ["请选择肉类,也可以跳过"]
              },
              {
                key: config.key5,
                values: ["当前🥬蔬菜:"]
              },
              {
                key: config.key6,
                values: [ingredients[session.event.user.id]['material'].join('||')]
              }
            ]
          },
  
          keyboard: {
            content: {
              rows: [
                {
                  "buttons": [
                    btn(session.event.user.id,'1', '🥓午餐肉', '午餐肉', msg_id, '原料'),
                    btn(session.event.user.id,'2', '🌭香肠', '香肠', msg_id, '原料'),
                    btn(session.event.user.id,'3', '🌭  腊肠', '花菜', msg_id, '原料'),
                  ]
                },
                {
                  "buttons": [
                    btn(session.event.user.id,'4', '🐤鸡肉', '鸡肉', msg_id, '原料'),
                    btn(session.event.user.id,'5', '🐷猪肉', '猪肉', msg_id, '原料'),
                    btn(session.event.user.id,'6', '🥚鸡蛋', '鸡蛋', msg_id, '原料'),
                  ]
                },
                {
                  "buttons": [
                    btn(session.event.user.id,'7', '🦐虾', '虾', msg_id, '原料'),
                    btn(session.event.user.id,'8', '🐮牛肉', '牛肉', msg_id, '原料'),
                    btn(session.event.user.id,'9', '🦴骨头', '骨头', msg_id, '原料'),
                    btn(session.event.user.id,'10', '🐟鱼', '鱼', msg_id, '原料'),
                  ]
                },
                {
                  "buttons": [
                    btn(session.event.user.id,'16', '⬇️点击下方厨具开始烹饪', '111', msg_id, '111'),
                  ]
                },
                {
                  "buttons": [
                    btn(session.event.user.id,'11', '烤箱', '烤箱', msg_id, '制作'),
                    btn(session.event.user.id,'12', '炸锅', '空气炸锅', msg_id, '制作'),
                    btn(session.event.user.id,'13', '微波', '微波炉', msg_id, '制作'),
                    btn(session.event.user.id,'14', '电饭煲', '电饭煲', msg_id, '制作'),
                    btn(session.event.user.id,'15', '大锅', '一口大锅', msg_id, '制作'),
                  ]
                },
              ]
            }
          },
          msg_id: msg_id,
          timestamp: session.timestamp,
          msg_seq: 3
        }
        await session.bot.internal.sendMessage(session.channelId, md)
        break;
      }
      case '原料':
        if (!ingredients[session.event.user.id]) {
          ingredients[session.event.user.id] = { material: [] }
          ingredients[session.event.user.id]['material'].push(data)
        } else {
          ingredients[session.event.user.id]['material']?.includes(data) ? null : ingredients[session.event.user.id]['material'].push(data)
        }
        break;
      case '制作':
        const msg_id = Adata.split(' ')[1]
        let matchedRecipes = t.filter(recipe => countMatches(recipe, session,data) > 0)
        matchedRecipes.sort((recipe1, recipe2) => countMatches(recipe2, session,data) - countMatches(recipe1, session,data))
        const { url } = await session.app['server.temp'].create(`file://${resolve(`${__dirname}/img/1.jpg`)}`)
        let btnLise: { buttons: any[] }[] = []
        for (let i in matchedRecipes) {
          const url = "https://www.bilibili.com/video/" + matchedRecipes[i]?.bv
          btnLise.push({ "buttons": [urlbtn(session.event.user.id,i.toString(), matchedRecipes[i]?.name, url)] })
          if (btnLise.length > 4) break
        }
        const cooklist=matchedRecipes?.slice(0, 5)?.map(recipe => recipe.name)?.join('\r')
        console.log(cooklist)
        const md: object = {
          content: "111",
          msg_type: 2,
          markdown: {
            custom_template_id: config.mdid,
            params: [
              {
                key: config.key1,
                values: ["快点击按钮开始你的烹饪之旅"]
              },
              {
                key:config.key2,
                values: ["[img#256px #256px]"]
              },
              {
                key:config.key3,
                values: [url]
              },
              {
                key:config.key4,
                values: ["当前配料:"]
              },
              {
                key:config.key5,
                values: [ingredients[session.event.user.id]['material'].join('||')]
              },
              {
                key:config.key6,
                values: ["当前厨具:"]
              },
              {
                key:config.key7,
                values: [data]
              },
              {
                key:config.key8,
                values: [`当前<@${session.event.user.id}>可制作菜品:`]
              },
              {
                key:config.key9,
                values: [cooklist]
              },
              {
                key:config.key10,
                values: ["点击下方菜品名称查看制作方法"]
              },
            ]
          },

          keyboard: {
            content: {
              rows: btnLise
            }
          },
          msg_id: msg_id,
          timestamp: session.timestamp,
          msg_seq: 2
        }
        await session.bot.internal.sendMessage(session.channelId, md)
        delete ingredients[session.event.user.id]
        break;
    }
  })
  ctx.command('菜单', '烹饪指南', { authority: 0 })
    .action(async ({ session }) => {
      const { platform } = session
      if (platform == 'qqguild') return `该功能目前只在QQ群官方机器人开放，敬请期待后续更新`
      if (platform !== 'qq') return `该功能目前只在QQ群官方机器人开放，敬请期待后续更新`
      const { url } = await session.app['server.temp'].create(`file://${resolve(`${__dirname}/img/1.jpg`)}`)
      const md: object = {
        content: "111",
        msg_type: 2,
        markdown: {
          custom_template_id: config.mdid,
          params: [
            {
              key: config.key1,
              values: [`选择原料  <@${session.userId}>`]
            },
            {
              key: config.key2,
              values: ["[img#512px #512px]"]
            },
            {
              key: config.key3,
              values: [url]
            },
            {
              key: config.key4,
              values: ["请选择蔬菜，至少选择一样哦"]
            },
          ]
        },

        keyboard: {
          content: {
            rows: [
              {
                "buttons": [
                  btn(session.userId,'1', '🥔土豆', '土豆', session.messageId, '原料'),
                  btn(session.userId,'2', '🥕胡萝卜', '胡萝卜', session.messageId, '原料'),
                  btn(session.userId,'3', '🥦花菜', '花菜', session.messageId, '原料'),
                ]
              },
              {
                "buttons": [
                  btn(session.userId,'4', '🥣白萝卜', '白萝卜', session.messageId, '原料'),
                  btn(session.userId,'5', '🥒西葫芦', '西葫芦', session.messageId, '原料'),
                  btn(session.userId,'6', '🍅番茄', '番茄', session.messageId, '原料'),
                ]
              },
              {
                "buttons": [
                  btn(session.userId,'7', '🥬芹菜', '芹菜', session.messageId, '原料'),
                  btn(session.userId,'8', '🥒黄瓜', '黄瓜', session.messageId, '原料'),
                  btn(session.userId,'9', '🧅洋葱', '洋葱', session.messageId, '原料'),
                ]
              },
              {
                "buttons": [
                  btn(session.userId,'10', '🎍莴笋', '莴笋', session.messageId, '原料'),
                  btn(session.userId,'11', '🍄菌菇', '菌菇', session.messageId, '原料'),
                  btn(session.userId,'12', '🍆茄子', '茄子', session.messageId, '原料'),
                ]
              },
              {
                "buttons": [
                  btn(session.userId,'13', '🍲豆腐', '豆腐', session.messageId, '原料'),
                  btn(session.userId,'14', '🥗包菜', '包菜', session.messageId, '原料'),
                  btn(session.userId,'15', '🥬白菜', '白菜', session.messageId, '原料'),
                  btn(session.userId,'16', '确认', '确认', session.messageId, '肉类')
                ]
              },
            ]
          }
        },
        msg_id: session.messageId,
        timestamp: session.timestamp,
        msg_seq: 1
      }
      await session.bot.internal.sendMessage(session.channelId, md)
    })
  function btn(u,a: string, b: string, c: string, msgid: string, type: string) {
    return {
      "id": a,
      "render_data": {
        "label": b,
        "visited_label": b
      },
      "action": {
        "type": 1,
        "permission": {
          "type": 0,
          "specify_user_ids":[u]
        },
        "unsupport_tips": "兼容文本",
        "data": `${type} ${msgid} ${c}`
      },
    }
  }
  function urlbtn(u,a: string, b: string, c: string) {
    return {
      "id": a,
      "render_data": {
        "label": b,
        "visited_label": b
      },
      "action": {
        "type": 0,
        "permission": {
          "type": 2
        },
        "unsupport_tips": "兼容文本",
        "data": `${c}`
      },
    }
  }
  function countMatches(recipe, session: Session,tools) {
    return ingredients[session.event.user.id]['material']?.reduce((count, ingredient) => count + ((recipe.stuff.includes(ingredient)&&recipe.tools.includes(tools)) ? 1 : 0), 0)
  }
}

