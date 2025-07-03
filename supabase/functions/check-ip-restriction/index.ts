import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface IpRestrictionRequest {
  userId: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId }: IpRestrictionRequest = await req.json()

    // Get user from auth header
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user || user.id !== userId) {
      throw new Error('Invalid user token')
    }

    // Get client IP address
    const clientIp = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown'

    // Check for suspicious activity from this IP
    const { data: ipUsage, error: ipCheckError } = await supabase
      .from('ip_coupon_usage')
      .select('id, user_id')
      .eq('ip_address', clientIp)
      .order('used_at', { ascending: false })

    if (ipCheckError) {
      console.error('Error checking IP usage:', ipCheckError)
      throw new Error('Failed to check IP restriction')
    }

    // Check if this IP has created multiple accounts (more than 3)
    const uniqueUserIds = new Set<string>()
    ipUsage?.forEach(record => {
      if (record.user_id) {
        uniqueUserIds.add(record.user_id)
      }
    })

    // If this IP has been used with more than 3 different accounts, block it
    const isBlocked = uniqueUserIds.size > 3

    // If blocked, log the security event
    if (isBlocked) {
      await supabase.from('device_activity_logs').insert({
        user_id: userId,
        activity_type: 'security_violation',
        activity_details: {
          reason: 'multiple_accounts_from_ip',
          ip_address: clientIp,
          account_count: uniqueUserIds.size
        },
        ip_address: clientIp,
        risk_score: 90
      })
    }

    return new Response(
      JSON.stringify({
        blocked: isBlocked,
        reason: isBlocked ? 'Multiple accounts detected from this IP address' : null,
        accountCount: uniqueUserIds.size
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error checking IP restriction:', error)
    return new Response(
      JSON.stringify({ 
        blocked: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})