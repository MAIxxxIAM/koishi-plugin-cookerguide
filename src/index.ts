import {Context, Schema, Session } from 'koishi'
import t,{Recipe} from './recipe/recipe'
export const name = 'cookerguide'

export const usage =`
markdown模板：
{{.text1}}
{{.text2}}
{{.text3}}
{{.text4}}
{{.text5}}
{{.text6}}

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
  key1: Schema.string().default('text1'),
  key2: Schema.string().default('text2'),
  key3: Schema.string().default('text3'),
  key4: Schema.string().default('text4'),
  key5: Schema.string().default('text5'),
  key6: Schema.string().default('text6'),
  key7: Schema.string().default('text7'),
  key8: Schema.string().default('text8'),
  key9: Schema.string().default('text9'),
  key10: Schema.string().default('text10'),

})
let ingredients: object = {}
export function apply(ctx: Context, config: Config) {
  ctx.on('interaction/button', async (session) => {
    const { d,id } = session.event._data;
    try {
      await session.bot.internal.acknowledgeInteraction(session.event._data.d.id, {
          code: 0
      });
  }
  catch (e) {
  }
    // await session.bot.internal.acknowledgeInteraction(d.id,"1")
    const Adata = d.data.resolved.button_data
    const data = Adata.split(' ')[1]
    const btnType = Adata.split(' ')[0]
    switch (btnType) {
      case '肉类':{
        const vage=ingredients[session.event.user.id]?.['material']?ingredients[session.event.user.id]['material'].join('||'):'不吃蔬菜不是好孩子哦~'
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
                key: config.key4,
                values: ["请选择肉类,也可以跳过"]
              },
              {
                key: config.key5,
                values: ["当前🥬蔬菜:"]
              },
              {
                key: config.key6,
                values: [vage]
              }
            ]
          },
  
          keyboard: {
            content: {
              rows: [
                {
                  "buttons": [
                    btn(session.event.user.id,'🥓午餐肉', '🥓午餐肉', '午餐肉', '原料'),
                    btn(session.event.user.id,'🌭香肠', '🌭香肠', '香肠', '原料'),
                    btn(session.event.user.id,'🌭  腊肠', '🌭腊肠', '腊肠', '原料'),
                  ]
                },
                {
                  "buttons": [
                    btn(session.event.user.id,'🐤鸡肉', '🐤鸡肉', '鸡肉', '原料'),
                    btn(session.event.user.id,'🐷猪肉', '🐷猪肉', '猪肉', '原料'),
                    btn(session.event.user.id,'🥚鸡蛋', '🥚鸡蛋', '鸡蛋', '原料'),
                  ]
                },
                {
                  "buttons": [
                    btn(session.event.user.id,'🦐虾', '🦐虾', '虾', '原料'),
                    btn(session.event.user.id,'🐮牛肉', '🐮牛肉', '牛肉', '原料'),
                    btn(session.event.user.id,'🦴骨头', '🦴骨头', '骨头', '原料'),
                    btn(session.event.user.id,'🐟鱼', '🐟鱼', '鱼', '原料'),
                  ]
                },
                {
                  "buttons": [
                    btn(session.event.user.id,'烹饪', '⬇️点击下方厨具开始烹饪', '111', '111'),
                  ]
                },
                {
                  "buttons": [
                    btn(session.event.user.id,'烤箱', '烤箱', '烤箱', '制作'),
                    btn(session.event.user.id,'炸锅', '炸锅', '空气炸锅', '制作'),
                    btn(session.event.user.id,'微波', '微波', '微波炉', '制作'),
                    btn(session.event.user.id,'电饭煲', '电饭煲', '电饭煲', '制作'),
                    btn(session.event.user.id,'大锅', '大锅', '一口大锅', '制作'),
                  ]
                },
              ]
            }
          },
          event_id: id,
          timestamp: session.timestamp,
          msg_seq: Math.floor(Math.random() * 1000)
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
        let matchedRecipes = t.filter(recipe => countMatches(recipe, session,data) > 0)
        matchedRecipes.sort((recipe1, recipe2) => countMatches(recipe2, session,data) - countMatches(recipe1, session,data))
        let btnLise: { buttons: any[] }[] = []
        for (let i in matchedRecipes) {
          const url = "https://www.bilibili.com/video/" + matchedRecipes[i]?.bv
          btnLise.push({ "buttons": [urlbtn(i.toString(), matchedRecipes[i]?.name, url)] })
          if (btnLise.length > 4) break
        }
        const cooklist=matchedRecipes?.slice(0, 5)?.map(recipe => recipe.name)?.join('\r')
        if(!ingredients[session.event.user.id]?.['material']){
          const md = {
            content: "111",
          msg_type: 2,
          markdown: {
            custom_template_id: config.mdid,
            params: [
              {
                key: config.key1,
                values: ["请重新开始选菜"]
              },
            ]
          },

          keyboard: {
            content: {
              rows:[{buttons:[
                {
                  "id": '菜单',
                  "render_data": {
                    "label":'菜单',
                    "visited_label": `'菜单'`
                  },
                  "action": {
                    "type":2,
                    "permission": {
                      "type": 2,
                      "specify_user_ids":[session.event.user.id]
                    },
                    "unsupport_tips": "兼容文本",
                    "data": '菜单',
                    enter:true
                  },
                }
              ]}] 
            }
          },
          event_id:id,
          timestamp: session.timestamp,
          msg_seq: Math.floor(Math.random() * 1000)
          }
          await session.bot.internal.sendMessage(session.channelId, md)
          return
        }
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
          event_id:id,
          timestamp: session.timestamp,
          msg_seq: Math.floor(Math.random() * 1000)
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
                  btn(session.userId,'🥔土豆', '🥔土豆', '土豆',  '原料'),
                  btn(session.userId,'🥕胡萝卜', '🥕胡萝卜', '胡萝卜',  '原料'),
                  btn(session.userId,'🥦花菜', '🥦花菜', '花菜',  '原料'),
                ]
              },
              {
                "buttons": [
                  btn(session.userId,'🥣白萝卜', '🥣白萝卜', '白萝卜',  '原料'),
                  btn(session.userId,'🥒西葫芦', '🥒西葫芦', '西葫芦',  '原料'),
                  btn(session.userId,'🍅番茄', '🍅番茄', '番茄',  '原料'),
                ]
              },
              {
                "buttons": [
                  btn(session.userId,'🥬芹菜', '🥬芹菜', '芹菜',  '原料'),
                  btn(session.userId,'🥒黄瓜', '🥒黄瓜', '黄瓜',  '原料'),
                  btn(session.userId,'🧅洋葱', '🧅洋葱', '洋葱',  '原料'),
                ]
              },
              {
                "buttons": [
                  btn(session.userId,'🎍莴笋', '🎍莴笋', '莴笋',  '原料'),
                  btn(session.userId,'🍄菌菇', '🍄菌菇', '菌菇',  '原料'),
                  btn(session.userId,'🍆茄子', '🍆茄子', '茄子',  '原料'),
                ]
              },
              {
                "buttons": [
                  btn(session.userId,'🍲豆腐', '🍲豆腐', '豆腐',  '原料'),
                  btn(session.userId,'🥗包菜', '🥗包菜', '包菜',  '原料'),
                  btn(session.userId,'🥬白菜', '🥬白菜', '白菜',  '原料'),
                  btn(session.userId,'确认', '确认', '确认',  '肉类')
                ]
              },
            ]
          }
        },
        msg_id: session.messageId,
        timestamp: session.timestamp,
        msg_seq: Math.floor(Math.random() * 1000)
      }
      await session.bot.internal.sendMessage(session.channelId, md)
    })
  function btn(u:string,a: string, b: string, c: string, type: string) {
    return {
      "id": a,
      "render_data": {
        "label": b,
        "visited_label": `✅${b}`
      },
      "action": {
        "type": 1,
        "permission": {
          "type": 0,
          "specify_user_ids":[u]
        },
        "unsupport_tips": "兼容文本",
        "data": `${type} ${c}`
      },
    }
  }
  function urlbtn(a: string, b: string, c: string) {
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
  function countMatches(recipe: Recipe, session: Session,tools:string) {
    return ingredients[session.event.user.id]?.['material']?.reduce((count:number, ingredient: string) => count + ((recipe.stuff.includes(ingredient)&&recipe.tools.includes(tools)) ? 1 : 0), 0)
  }
}

